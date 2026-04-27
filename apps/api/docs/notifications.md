# Notification Module Documentation

## Overview

The Notification module provides a decorator-based system for triggering notifications from any controller endpoint. It supports:

- **Single notifications** — notify one user per request via `@Notify`
- **Batch notifications** — notify multiple users per request via `@BatchNotify`
- **Real-time delivery** — notifications are saved to DB and pushed via WebSocket (Socket.IO)
- **Offline storage** — if the user is not connected, the notification is persisted and available when they reconnect

---

## Architecture

```
Controller (decorator metadata)
    ↓
NotificationInterceptor (reads metadata + request data after handler executes)
    ↓
NotificationGateway.notifyUser()
    ↓
┌─────────────────────┐
│  Save to DB         │  (NotificationService → NotificationRepository)
│  Emit via WebSocket │  (Socket.IO → /notifications namespace)
└─────────────────────┘
```

---

## Setup

### 1. Import `NotificationModule`

The module that registers your controller must import `NotificationModule` (directly or via a parent module):

```ts
import { NotificationModule } from 'src/shared/notifications/notifications.module';

@Module({
  imports: [NotificationModule],
  controllers: [YourController],
})
export class YourModule {}
```

### 2. Add `NotificationInterceptor` to your controller

```ts
import { NotificationInterceptor } from 'src/shared/notifications/decorators/notification.interceptor';

@UseInterceptors(NotificationInterceptor)
@Controller({ version: '1', path: '/your-path' })
export class YourController {}
```

> **Important:** Without `@UseInterceptors(NotificationInterceptor)`, the `@Notify` and `@BatchNotify` decorators will have no effect — they only set metadata that the interceptor reads.

---

## Usage

### Single Notification — `@Notify(type)`

Use `@Notify` when you need to notify **one user** (typically the authenticated user) after an endpoint executes.

#### How it works

1. Decorate the method with `@Notify(NotificationType.XXX)`
2. Inside the handler, attach notification data to `req.notificationInfo`
3. After the handler returns, the interceptor reads the metadata and sends the notification

#### Interface

```ts
// Set on req.notificationInfo
interface notificationInfo {
  [key: string]: unknown;
}
```

#### Example — Notify on Sign-In

```ts
import { Notify } from 'src/shared/notifications/decorators/notify.decorator';
import { NotificationType } from 'src/app/enums/notification-type.enum';

@UseInterceptors(NotificationInterceptor)
@Controller({ version: '1', path: '/client-auth' })
export class ClientAuthController {
  @Post('sign-in')
  @Notify(NotificationType.NEW_SIGNIN)
  async signIn(
    @Body() dto: RequestClientSignInDto,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseClientSigninDto> {
    const result = await this.authService.signIn(dto);

    // Attach notification payload — the interceptor will pick this up
    req.notificationInfo = {
      userId: result.user.id,
      device: req.headers['user-agent'],
      ip: req.ip,
    };

    return result;
  }
}
```

#### Stacking Multiple `@Notify` Decorators

You can stack multiple `@Notify` decorators on the same method to send different notification types:

```ts
@Post('accept')
@Notify(NotificationType.REQUEST_ACCEPTED)
@Notify(NotificationType.NEW_MESSAGE)
async acceptRequest(
  @Body() dto: AcceptRequestDto,
  @Request() req: AdvancedRequest,
): Promise<void> {
  await this.requestService.accept(dto);

  req.notificationInfo = {
    requestId: dto.requestId,
    acceptedBy: req.user.sub,
  };
}
```

Both notification types will be sent to the authenticated user (`req.user.sub`) with the same payload.

---

### Batch Notification — `@BatchNotify(type)`

Use `@BatchNotify` when you need to notify **multiple users** with potentially different payloads after an endpoint executes.

#### How it works

1. Decorate the method with `@BatchNotify(NotificationType.XXX)`
2. Inside the handler, attach an array of `BatchNotificationInfo` to `req.batchNotificationInfo`
3. After the handler returns, the interceptor iterates the array and sends a notification to each user

#### Interfaces

```ts
interface BatchNotificationEntry {
  userId: string; // Target user ID
  payload: Record<string, unknown>; // Notification data for this user
}

interface BatchNotificationInfo {
  type: NotificationType; // Must match the @BatchNotify type
  entries: BatchNotificationEntry[]; // One entry per recipient
}
```

#### Example — Notify All Receivers of a Request

```ts
import { BatchNotify } from 'src/shared/notifications/decorators/notify.decorator';
import { NotificationType } from 'src/app/enums/notification-type.enum';

@UseInterceptors(NotificationInterceptor)
@Controller({ version: '1', path: '/requests' })
export class RequestController {
  @Post()
  @BatchNotify(NotificationType.REQUEST_RECEIVED)
  async create(
    @Body() dto: CreateRequestDto,
    @Request() req: AdvancedRequest,
  ): Promise<ResponseRequestDto | null> {
    const request = await this.requestService.sendRequest(dto, req.user.sub);

    // Each receiver gets their own notification
    req.batchNotificationInfo = [
      {
        type: NotificationType.REQUEST_RECEIVED,
        entries: dto.receiverIds.map((receiverId) => ({
          userId: receiverId,
          payload: {
            requestId: request.id,
            senderId: req.user.sub,
          },
        })),
      },
    ];

    return toDto(ResponseRequestDto, request);
  }
}
```

---

## Real-World Use Cases

### Case 1: Chat — New Message Notification

```ts
@Post(':conversationId/messages')
@BatchNotify(NotificationType.NEW_MESSAGE)
async sendMessage(
  @Param('conversationId') conversationId: string,
  @Body() dto: CreateMessageDto,
  @Request() req: AdvancedRequest,
): Promise<ResponseMessageDto> {
  const message = await this.messageService.create(conversationId, dto, req.user.sub);
  const participants = await this.conversationService.getParticipantIds(conversationId);

  // Notify all participants except the sender
  req.batchNotificationInfo = [
    {
      type: NotificationType.NEW_MESSAGE,
      entries: participants
        .filter((id) => id !== req.user.sub)
        .map((userId) => ({
          userId,
          payload: {
            conversationId,
            messageId: message.id,
            senderId: req.user.sub,
            preview: message.content.substring(0, 100),
          },
        })),
    },
  ];

  return toDto(ResponseMessageDto, message);
}
```

### Case 2: Session — Request Accepted / Rejected

```ts
@Post(':id/accept')
@Notify(NotificationType.REQUEST_ACCEPTED)
async acceptRequest(
  @Param('id') id: string,
  @Request() req: AdvancedRequest,
): Promise<void> {
  const request = await this.requestService.accept(id, req.user.sub);

  // Notify the original sender that their request was accepted
  req.notificationInfo = {
    userId: request.senderId,  // used for NEW_SIGNIN-style routing
    requestId: request.id,
    acceptedBy: req.user.sub,
  };
}
```

### Case 3: Follow — New Follower Notification

```ts
@Post(':id/follow')
@Notify(NotificationType.NEW_FOLLOWER)
async followUser(
  @Param('id') targetUserId: string,
  @Request() req: AdvancedRequest,
): Promise<void> {
  await this.followService.follow(req.user.sub, targetUserId);

  req.notificationInfo = {
    followerId: req.user.sub,
    followedUserId: targetUserId,
  };
}
```

### Case 4: Combining `@Notify` and `@BatchNotify` on the Same Method

```ts
@Post(':sessionId/start')
@Notify(NotificationType.SESSION_STARTED)
@BatchNotify(NotificationType.SESSION_STARTED)
async startSession(
  @Param('sessionId') sessionId: string,
  @Request() req: AdvancedRequest,
): Promise<void> {
  const session = await this.sessionService.start(sessionId, req.user.sub);
  const participantIds = await this.sessionService.getParticipantIds(sessionId);

  // Single notify — for the host
  req.notificationInfo = {
    sessionId,
    status: 'started',
  };

  // Batch notify — for all other participants
  req.batchNotificationInfo = [
    {
      type: NotificationType.SESSION_STARTED,
      entries: participantIds
        .filter((id) => id !== req.user.sub)
        .map((userId) => ({
          userId,
          payload: { sessionId, hostId: req.user.sub },
        })),
    },
  ];
}
```

---

## WebSocket Client (Mobile / Web)

Connect to the `/notifications` namespace with an access token:

```ts
import { io } from 'socket.io-client';

const socket = io('https://your-api.com/notifications', {
  auth: { token: 'Bearer <access_token>' },
});

socket.on('notification', (notification) => {
  // notification = { id, type, userId, payload, createdAt, ... }
  console.log('New notification:', notification);
});
```

---

## Adding a New Notification Type

1. **Add the enum value** in `src/app/enums/notification-type.enum.ts`:

   ```ts
   export enum NotificationType {
     // ... existing types
     YOUR_NEW_TYPE = 'YOUR_NEW_TYPE',
   }
   ```

2. **Decorate your controller method** with `@Notify` or `@BatchNotify`

3. **Attach the payload** to `req.notificationInfo` or `req.batchNotificationInfo` inside the handler

4. **Ensure the controller** has `@UseInterceptors(NotificationInterceptor)`

5. **Ensure the module** imports `NotificationModule`

---

## Common Mistakes

| Mistake                                                                | Symptom                                         | Fix                                                                               |
| ---------------------------------------------------------------------- | ----------------------------------------------- | --------------------------------------------------------------------------------- |
| Missing `@UseInterceptors(NotificationInterceptor)` on controller      | Decorator is set but notification is never sent | Add the interceptor to the controller class                                       |
| `NotificationModule` not imported in the route module                  | DI error on startup                             | Import `NotificationModule` in the module that registers the controller           |
| `req.batchNotificationInfo` type doesn't match `@BatchNotify` type     | Notification silently skipped                   | Ensure `batchNotificationInfo[].type` matches the type passed to `@BatchNotify()` |
| Forgetting to set `req.notificationInfo` / `req.batchNotificationInfo` | Interceptor runs but finds no data              | Always set the payload in the controller handler before returning                 |
