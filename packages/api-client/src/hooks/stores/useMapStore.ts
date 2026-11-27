import { objectUtils } from "@softsurgery/lib";
import { ResponseUserDto } from "api-client";
import { Cluster, NearbyUser } from "../types/map";
import * as Location from "expo-location";
import { create } from "zustand";
import isEqual from "lodash/isEqual";

interface MapData {
  parameters: {
    radius: number;
    rangeMin: number;
    rangeMax: number;
    updateInterval: number;
  };
  settings: {
    radius: number;
    showUsernames: boolean;
    mode: "sattelite" | "map";
  };
  draftSettings: {
    radius: number;
    showUsernames: boolean;
    mode: "sattelite" | "map";
  };
  hasInitializedParameters: boolean;
  connected: boolean;
  location: Location.LocationObject | null;
  users: ResponseUserDto[];
  usersById: Record<string, ResponseUserDto>;
  nearbyUsers: NearbyUser[];
  nearbyUsersById: Record<string, NearbyUser>;
  clusters: Cluster[];
  reconnection: {
    reconnecting: boolean;
    reconnectAttempt: number;
    reconnectDelay: number;
  };
  loading: boolean;
  restartSignal: number;
}

interface MapStore extends MapData {
  //common
  set: <K extends keyof MapData>(name: K, value: MapData[K]) => void;
  setNested: <T>(path: string, value: T) => void;
  reset: () => void;
  triggerRestart: () => void;
  //additional
  addNearbyUser: (user: NearbyUser) => void;
  addUser: (user: ResponseUserDto) => void;

  setNearbyUsers: (prev: NearbyUser[]) => void;
  setUsers: (prev: ResponseUserDto[]) => void;
  updateNearbyUser: (data: NearbyUser) => void;
  updateNearbyUserPresence: (userId: string, isOnline: boolean) => void;

  getUserById: (id: string) => ResponseUserDto | null;
  getNearbyUserById: (id: string) => NearbyUser | null;

  restart: () => void;
}

const initialState: MapData = {
  parameters: {
    radius: 50,
    rangeMax: 100,
    rangeMin: 0,
    updateInterval: 15,
  },
  settings: {
    radius: 50,
    showUsernames: true,
    mode: "map",
  },
  draftSettings: {
    radius: 50,
    showUsernames: true,
    mode: "map",
  },
  hasInitializedParameters: false,
  connected: false,
  location: null,
  users: [],
  usersById: {},
  clusters: [],
  nearbyUsers: [],
  nearbyUsersById: {},
  reconnection: {
    reconnecting: false,
    reconnectAttempt: 0,
    reconnectDelay: 0,
  },
  loading: true,
  restartSignal: 0,
};

export const useMapStore = create<MapStore>((set, get) => ({
  ...initialState,
  set: (name, value) => {
    set((state) => {
      if (Object.is(state[name], value)) return state;
      return {
        ...state,
        [name]: value,
      };
    });
  },
  setNested: (path: string, value: unknown) => {
    if (!path.includes(".")) {
      set((state) => {
        if (Object.is(state[path as keyof MapData], value)) return state;
        return {
          ...state,
          [path]: value,
        };
      });
      return;
    }

    const [rootKey, ...restPath] = path.split(".");
    const nestedPath = restPath.join(".");

    set((state) => {
      const rootValue = state[rootKey as keyof MapData];
      if (typeof rootValue !== "object" || rootValue === null) {
        throw new Error(`Cannot set nested path on non-object: ${rootKey}`);
      }

      if (Object.is(objectUtils.getDeepValue(rootValue, nestedPath), value)) {
        return state;
      }

      const updatedRoot = objectUtils.setDeepValue(
        { ...(rootValue as object) },
        nestedPath,
        value,
      );

      return {
        ...state,
        [rootKey]: updatedRoot,
      };
    });
  },

  addUser: (user: ResponseUserDto) => {
    set((state) => {
      const existing = state.usersById[user.id];

      if (!existing) {
        return {
          ...state,
          users: [...state.users, user],
          usersById: { ...state.usersById, [user.id]: user },
        };
      }

      if (isEqual(existing, user)) {
        return state;
      }

      return {
        ...state,
        users: state.users.map((u) => (u.id === user.id ? user : u)),
        usersById: { ...state.usersById, [user.id]: user },
      };
    });
  },

  addNearbyUser: (user: NearbyUser) => {
    set((state) => {
      const existing = state.nearbyUsersById[user.userId];

      if (!existing) {
        return {
          ...state,
          nearbyUsers: [...state.nearbyUsers, user],
          nearbyUsersById: { ...state.nearbyUsersById, [user.userId]: user },
        };
      }

      if (isEqual(existing, user)) {
        return state;
      }

      return {
        ...state,
        nearbyUsers: state.nearbyUsers.map((u) =>
          u.userId === user.userId ? user : u,
        ),
        nearbyUsersById: { ...state.nearbyUsersById, [user.userId]: user },
      };
    });
  },

  setUsers: (users: ResponseUserDto[]) => {
    if (users.length === 0) return;
    set((state) => {
      const nextById = { ...state.usersById };
      let changed = false;

      for (const newUser of users) {
        const existing = nextById[newUser.id];
        if (existing) {
          if (!isEqual(existing, newUser)) {
            nextById[newUser.id] = { ...existing, ...newUser };
            changed = true;
          }
        } else {
          nextById[newUser.id] = newUser;
          changed = true;
        }
      }

      if (!changed) return state;
      return {
        ...state,
        usersById: nextById,
        users: Object.values(nextById),
      };
    });
  },
  setNearbyUsers: (users: NearbyUser[]) => {
    set((state) => {
      const nextById: Record<string, NearbyUser> = {};
      const nextList: NearbyUser[] = [];
      let changed = users.length !== state.nearbyUsers.length;

      for (const newUser of users) {
        const existing = state.nearbyUsersById[newUser.userId];
        if (existing) {
          if (isEqual(existing, newUser)) {
            nextById[newUser.userId] = existing;
            nextList.push(existing);
          } else {
            const merged = { ...existing, ...newUser };
            nextById[newUser.userId] = merged;
            nextList.push(merged);
            changed = true;
          }
        } else {
          nextById[newUser.userId] = newUser;
          nextList.push(newUser);
          changed = true;
        }
      }

      if (!changed) return state;

      // Prune cached user profiles for users who are no longer nearby
      let nextUsersById = state.usersById;
      let nextUsers = state.users;
      const hasStaleUsers = state.users.some((u) => !(u.id in nextById));
      if (hasStaleUsers) {
        nextUsersById = {};
        nextUsers = [];
        for (const u of state.users) {
          if (u.id in nextById) {
            nextUsersById[u.id] = u;
            nextUsers.push(u);
          }
        }
      }

      return {
        ...state,
        nearbyUsers: nextList,
        nearbyUsersById: nextById,
        users: nextUsers,
        usersById: nextUsersById,
      };
    });
  },
  updateNearbyUser: (data: NearbyUser) => {
    set((state) => {
      const existing = state.nearbyUsersById[data.userId];

      if (
        existing &&
        existing.updatedAt &&
        data.updatedAt &&
        data.updatedAt < existing.updatedAt
      ) {
        return state;
      }

      if (existing && isEqual(existing, data)) {
        return state;
      }

      const merged = existing ? { ...existing, ...data } : data;
      const nextById = { ...state.nearbyUsersById, [data.userId]: merged };
      const nextList = existing
        ? state.nearbyUsers.map((u) => (u.userId === data.userId ? merged : u))
        : [...state.nearbyUsers, merged];

      return { ...state, nearbyUsers: nextList, nearbyUsersById: nextById };
    });
  },
  updateNearbyUserPresence: (userId: string, isOnline: boolean) => {
    set((state) => {
      const existing = state.nearbyUsersById[userId];
      if (!existing || existing.isOnline === isOnline) return state;

      const updated = { ...existing, isOnline };
      return {
        ...state,
        nearbyUsersById: { ...state.nearbyUsersById, [userId]: updated },
        nearbyUsers: state.nearbyUsers.map((u) =>
          u.userId === userId ? updated : u,
        ),
      };
    });
  },
  getUserById: (id: string) => {
    return get().usersById[id] ?? null;
  },
  getNearbyUserById: (id: string) => {
    return get().nearbyUsersById[id] ?? null;
  },
  restart: () => {
    set({
      nearbyUsers: [],
      nearbyUsersById: {},
      users: [],
      usersById: {},
      connected: false,
    });
  },
  triggerRestart: () => {
    set((state) => ({ restartSignal: state.restartSignal + 1 }));
  },
  reset: () => {
    set({ ...initialState });
  },
}));
