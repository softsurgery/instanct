import { Inject, Injectable, Logger, Optional } from "@nestjs/common";
import { USER_REPOSITORY, AppUserRepository } from "../tokens/user-access";
import {
  ClientPresenceSource,
  SocketConnectionMeta,
  UserPresenceEvent,
  UserPresenceStatus,
} from "../interfaces";

export type {
  ClientPresenceSource,
  SocketConnectionMeta,
  UserPresenceEvent,
  UserPresenceStatus,
};

@Injectable()
export class UserPresenceService {
  private readonly logger = new Logger(UserPresenceService.name);

  /**
   * Internal registry mapping userId to an active socket map (socketId -> SocketConnectionMeta).
   * Supports multiple sockets across different clients/sources (e.g., mobile and web).
   */
  private readonly userSockets = new Map<
    string,
    Map<string, SocketConnectionMeta>
  >();

  /**
   * Listeners subscribed to presence change events.
   */
  private readonly presenceListeners = new Set<
    (event: UserPresenceEvent) => void
  >();

  constructor(
    @Optional()
    @Inject(USER_REPOSITORY)
    private readonly userRepository?: AppUserRepository,
  ) {}

  /**
   * Registers a connected socket for a user, associating it with an explicit source (e.g. 'web', 'mobile').
   * If the user was disconnected or their active sources changed, emits a presence change notification.
   */
  trackConnection(
    userId: string,
    socketId: string,
    source: ClientPresenceSource = "web",
    namespace?: string,
  ): { isConnected: boolean; meta?: SocketConnectionMeta } {
    if (!userId || !socketId) {
      return { isConnected: false };
    }

    let socketMap = this.userSockets.get(userId);
    const wasConnected = !!socketMap && socketMap.size > 0;

    if (!socketMap) {
      socketMap = new Map();
      this.userSockets.set(userId, socketMap);
    }

    const previousSources = this.getUserSources(userId);

    const connectionMeta: SocketConnectionMeta = {
      socketId,
      source,
      namespace,
      connectedAt: new Date(),
    };

    socketMap.set(socketId, connectionMeta);

    const currentSources = this.getUserSources(userId);
    const sourcesChanged =
      previousSources.length !== currentSources.length ||
      !previousSources.every((s) => currentSources.includes(s));

    if (!wasConnected || sourcesChanged) {
      this.logger.debug(
        `User ${userId} connected on socket ${socketId} from source '${source}'${
          namespace ? ` (${namespace})` : ""
        }`,
      );

      this.emitPresenceChange({
        userId,
        isConnected: true,
        sources: currentSources,
        lastSeen: null,
      });
    }

    return { isConnected: true, meta: connectionMeta };
  }

  /**
   * Deregisters a disconnected socket for a user.
   * If all sockets for the user have disconnected, updates lastSeen in the database and emits a disconnection event.
   */
  trackDisconnection(
    userId: string,
    socketId: string,
    namespace?: string,
  ): { isConnected: boolean; disconnectedMeta?: SocketConnectionMeta } {
    if (!userId) {
      return { isConnected: false };
    }

    const socketMap = this.userSockets.get(userId);
    if (!socketMap) {
      return { isConnected: false };
    }

    const disconnectedMeta = socketMap.get(socketId);
    socketMap.delete(socketId);
    const isConnected = socketMap.size > 0;

    if (!isConnected) {
      this.userSockets.delete(userId);
      const now = new Date();

      this.updateLastSeen(userId, now).catch((err) => {
        this.logger.error(`Failed to update lastSeen for user ${userId}`, err);
      });

      this.logger.debug(
        `User ${userId} disconnected${namespace ? ` from (${namespace})` : ""}`,
      );

      this.emitPresenceChange({
        userId,
        isConnected: false,
        sources: [],
        lastSeen: now,
      });

      return { isConnected: false, disconnectedMeta };
    }

    const currentSources = this.getUserSources(userId);
    this.emitPresenceChange({
      userId,
      isConnected: true,
      sources: currentSources,
      lastSeen: null,
    });

    return { isConnected: true, disconnectedMeta };
  }

  /**
   * Checks whether a user currently has any active socket connections.
   */
  isUserConnected(userId: string): boolean {
    const socketMap = this.userSockets.get(userId);
    return !!socketMap && socketMap.size > 0;
  }

  /**
   * Retrieves all unique active sources (e.g. ['web'], ['mobile']) for a given user.
   */
  getUserSources(userId: string): ClientPresenceSource[] {
    const socketMap = this.userSockets.get(userId);
    if (!socketMap || socketMap.size === 0) {
      return [];
    }

    const sources = new Set<ClientPresenceSource>();
    for (const meta of socketMap.values()) {
      if (meta.source) {
        sources.add(meta.source);
      }
    }

    return Array.from(sources);
  }

  /**
   * Retrieves the presence status (connected state, active sources, and lastSeen) for a single user.
   */
  async getUserStatus(userId: string): Promise<UserPresenceStatus> {
    const isConnected = this.isUserConnected(userId);
    const sources = this.getUserSources(userId);
    let lastSeen: Date | null = null;

    if (!isConnected && this.userRepository) {
      try {
        const user = await this.userRepository.findOneById(userId);
        lastSeen = user?.lastSeen ?? null;
      } catch (err) {
        this.logger.error(
          `Failed to retrieve lastSeen for user ${userId}`,
          err,
        );
      }
    }

    return {
      userId,
      isConnected,
      sources,
      lastSeen,
    };
  }

  /**
   * Retrieves presence statuses for multiple users in a single batch query.
   */
  async getUsersStatus(userIds: string[]): Promise<UserPresenceStatus[]> {
    if (!userIds || userIds.length === 0) {
      return [];
    }
    return Promise.all(userIds.map((id) => this.getUserStatus(id)));
  }

  /**
   * Persists the lastSeen timestamp for a user into the underlying database repository.
   */
  async updateLastSeen(userId: string, date: Date = new Date()): Promise<void> {
    if (!this.userRepository || !userId) {
      return;
    }
    try {
      await this.userRepository.update(userId, { lastSeen: date });
    } catch (err) {
      this.logger.error(`Failed to persist lastSeen for user ${userId}`, err);
    }
  }

  /**
   * Subscribes an observer callback to global presence changes and returns an unsubscribe function.
   */
  onPresenceChange(listener: (event: UserPresenceEvent) => void): () => void {
    this.presenceListeners.add(listener);
    return () => {
      this.presenceListeners.delete(listener);
    };
  }

  /**
   * Dispatches a presence change event to all registered listener callbacks.
   */
  emitPresenceChange(event: UserPresenceEvent): void {
    for (const listener of this.presenceListeners) {
      try {
        listener(event);
      } catch (err) {
        this.logger.error("Error executing presence listener callback", err);
      }
    }
  }
}
