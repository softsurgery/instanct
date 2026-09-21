# Database Triggers System

The database triggers system provides a centralized, type-safe way to define and synchronize MySQL database triggers within the NestJS application. Triggers are automatically registered, validated, and created during application bootstrap.

## Architecture

### Core Components

#### `DatabaseTrigger` Interface

Defines the contract for creating database triggers:

```typescript
export interface TriggerApply {
  table: string;
  type: 'BEFORE' | 'AFTER';
  operation: 'INSERT' | 'UPDATE' | 'DELETE';
}

export interface DatabaseTrigger {
  name: string;
  apply: TriggerApply[];
  createFunctionSql(): string;
  createTriggerSql(apply: TriggerApply, triggerName: string): string;
  triggerName(apply: TriggerApply): string;
  dropSql(): string[];
}
```

#### `AbstractTrigger` Class

Base implementation providing:
- Automatic trigger name generation (respects MySQL's 64-character identifier limit)
- Automatic drop statements for all apply entries
- Helper methods for subclasses

#### `TriggerRegistry` Service

Injectable service that collects all registered triggers:

```typescript
@Injectable()
export class TriggerRegistry {
  register(trigger: DatabaseTrigger): void;
  getAll(): DatabaseTrigger[];
}
```

#### `TriggerSynchronizer` Service

Runs during application bootstrap (`OnApplicationBootstrap`) and:
1. Drops all existing triggers (using `dropSql()`)
2. Executes any database functions (using `createFunctionSql()`)
3. Creates all triggers in the `apply` array

## Creating a Trigger

### Step 1: Create the Trigger Class

Extend `AbstractTrigger` and implement required methods:

```typescript
import {
  AbstractTrigger,
  TriggerApply,
} from 'src/shared/database/interfaces/database-trigger.interface';

export class MyEventTrigger extends AbstractTrigger {
  // Base name for this trigger (used in trigger name generation)
  name = 'my_event_sync';

  // Define which table/operation combinations trigger this
  apply: TriggerApply[] = [
    {
      table: 'events',
      type: 'AFTER',
      operation: 'INSERT',
    },
    {
      table: 'events',
      type: 'AFTER',
      operation: 'UPDATE',
    },
  ];

  // Optional: return database function creation SQL (rarely needed in MySQL)
  createFunctionSql(): string {
    return ''; // Empty string = skip function creation
  }

  // Generate the CREATE TRIGGER statement for a specific apply entry
  createTriggerSql(apply: TriggerApply, triggerName: string): string {
    return `
      CREATE TRIGGER \`${triggerName}\`
      ${apply.type} ${apply.operation} ON \`${apply.table}\`
      FOR EACH ROW
      BEGIN
        -- Your trigger logic here
        UPDATE some_table
        SET updated_at = NOW()
        WHERE id = NEW.id;
      END;
    `;
  }
}
```

### Step 2: Register in Module

In your module's `constructor`, register the trigger with the `TriggerRegistry`:

```typescript
import { Module } from '@nestjs/common';
import { TriggerRegistry } from 'src/shared/database/services/trigger-registry.service';
import { MyEventTrigger } from './triggers/my-event.trigger';

@Module({
  // ... module config
})
export class MyModule {
  constructor(registry: TriggerRegistry) {
    registry.register(new MyEventTrigger());
  }
}
```

## Complete Example: Conversation Participants Sync

The `ConversationParticipantsTrigger` syncs a denormalized `participantsIdentifiers` column whenever:
1. A participant is added to a conversation
2. A participant is removed from a conversation
3. A user's name is updated

### Trigger Definition

```typescript
export class ConversationParticipantsTrigger extends AbstractTrigger {
  name = 'conv_participants_sync';

  apply: TriggerApply[] = [
    {
      table: 'conversations_participants_users',
      type: 'AFTER',
      operation: 'INSERT',
    },
    {
      table: 'conversations_participants_users',
      type: 'AFTER',
      operation: 'DELETE',
    },
    {
      table: 'users',
      type: 'AFTER',
      operation: 'UPDATE',
    },
  ];

  createFunctionSql(): string {
    return '';
  }

  private participantsSelectSql(conversationIdExpr: string): string {
    return `
      SELECT GROUP_CONCAT(
        CASE
          WHEN u.firstName IS NOT NULL AND u.lastName IS NOT NULL
          THEN CONCAT(
            CONCAT(UPPER(LEFT(u.firstName, 1)), SUBSTRING(u.firstName, 2)), 
            ' ', 
            CONCAT(UPPER(LEFT(u.lastName, 1)), SUBSTRING(u.lastName, 2))
          )
          WHEN u.username IS NOT NULL THEN u.username
          ELSE 'unknown'
        END
        SEPARATOR ','
      )
      FROM conversations_participants_users cp
      INNER JOIN users u ON u.id = cp.usersId
      WHERE cp.conversationsId = ${conversationIdExpr}
    `;
  }

  createTriggerSql(apply: TriggerApply, triggerName: string): string {
    if (apply.table === 'conversations_participants_users') {
      // For DELETE operations, use OLD instead of NEW
      const row = apply.operation === 'DELETE' ? 'OLD' : 'NEW';
      
      return `
        CREATE TRIGGER \`${triggerName}\`
        ${apply.type} ${apply.operation} ON \`${apply.table}\`
        FOR EACH ROW
        BEGIN
          UPDATE conversations c
          SET c.participantsIdentifiers = (${this.participantsSelectSql(`${row}.conversationsId`)})
          WHERE c.id = ${row}.conversationsId;
        END;
      `;
    }

    // For users table: update all conversations this user is in
    return `
      CREATE TRIGGER \`${triggerName}\`
      ${apply.type} ${apply.operation} ON \`${apply.table}\`
      FOR EACH ROW
      BEGIN
        UPDATE conversations c
        SET c.participantsIdentifiers = (${this.participantsSelectSql('c.id')})
        WHERE c.id IN (
          SELECT cp.conversationsId
          FROM conversations_participants_users cp
          WHERE cp.usersId = NEW.id
        );
      END;
    `;
  }
}
```

### Registration in ChatModule

```typescript
@Module({
  // ... module config
})
export class ChatModule {
  constructor(registry: TriggerRegistry) {
    registry.register(new ConversationParticipantsTrigger());
  }
}
```

### Generated Triggers

Three MySQL triggers are created:
- `conv_participants_sync_insert_conversations_participants_users` — on INSERT to join table
- `conv_participants_sync_delete_conversations_participants_users` — on DELETE from join table
- `conv_participants_sync_update_users` — on UPDATE to users table

## Key Points

### Naming

- Trigger names are automatically generated from `name`, `operation`, and `table`
- Names are truncated to 64 characters (MySQL's identifier limit)
- Format: `{name}_{operation}_{table}`

### OLD vs NEW

- Use `NEW` for INSERT and UPDATE operations
- Use `OLD` for DELETE operations
- Both can be used in BEFORE triggers to modify values

### Best Practices

1. **Keep trigger logic simple** — complex logic should be in application code
2. **Use denormalization wisely** — triggers are best for maintaining denormalized columns
3. **Test thoroughly** — verify triggers work correctly in all scenarios
4. **Document the intent** — explain why the trigger exists and what it maintains
5. **Handle NULL values** — always consider NULL cases in trigger logic

### Performance Considerations

- Triggers run for every affected row during bulk operations
- Avoid expensive subqueries or full-table scans in triggers
- Consider batching large updates to minimize trigger overhead

## Debugging

### Check Registered Triggers

```typescript
// In any component with TriggerRegistry injected
constructor(private registry: TriggerRegistry) {}

someMethod() {
  const triggers = this.registry.getAll();
  console.log('Registered triggers:', triggers.map(t => t.name));
}
```

### View Created Triggers in MySQL

```sql
SHOW TRIGGERS WHERE `Table` = 'your_table_name';
```

### View Trigger Definition

```sql
SHOW CREATE TRIGGER `trigger_name`\G
```

## Common Patterns

### Pattern 1: Synchronize Denormalized Field

Keep a `count` or `sum` field in sync when child records are added/removed:

```typescript
apply: TriggerApply[] = [
  { table: 'child_records', type: 'AFTER', operation: 'INSERT' },
  { table: 'child_records', type: 'AFTER', operation: 'DELETE' },
];

createTriggerSql(apply: TriggerApply, triggerName: string): string {
  const row = apply.operation === 'DELETE' ? 'OLD' : 'NEW';
  return `
    CREATE TRIGGER \`${triggerName}\`
    AFTER ${apply.operation} ON \`${apply.table}\`
    FOR EACH ROW
    BEGIN
      UPDATE parent_table
      SET child_count = (SELECT COUNT(*) FROM child_records WHERE parent_id = ${row}.parent_id)
      WHERE id = ${row}.parent_id;
    END;
  `;
}
```

### Pattern 2: Update Timestamp on Related Record

When a child record changes, update the parent's `updatedAt`:

```typescript
apply: TriggerApply[] = [
  { table: 'comments', type: 'AFTER', operation: 'UPDATE' },
];

createTriggerSql(apply: TriggerApply, triggerName: string): string {
  return `
    CREATE TRIGGER \`${triggerName}\`
    AFTER UPDATE ON \`${apply.table}\`
    FOR EACH ROW
    BEGIN
      UPDATE posts
      SET updated_at = NOW()
      WHERE id = NEW.post_id;
    END;
  `;
}
```

### Pattern 3: Audit Trail

Log changes to an audit table:

```typescript
apply: TriggerApply[] = [
  { table: 'sensitive_data', type: 'AFTER', operation: 'UPDATE' },
  { table: 'sensitive_data', type: 'AFTER', operation: 'DELETE' },
];

createTriggerSql(apply: TriggerApply, triggerName: string): string {
  if (apply.operation === 'UPDATE') {
    return `
      CREATE TRIGGER \`${triggerName}\`
      AFTER UPDATE ON \`sensitive_data\`
      FOR EACH ROW
      BEGIN
        INSERT INTO audit_log (entity_type, entity_id, action, old_value, new_value)
        VALUES ('sensitive_data', NEW.id, 'UPDATE', OLD.data, NEW.data);
      END;
    `;
  }
  
  return `
    CREATE TRIGGER \`${triggerName}\`
    AFTER DELETE ON \`sensitive_data\`
    FOR EACH ROW
    BEGIN
      INSERT INTO audit_log (entity_type, entity_id, action, old_value)
      VALUES ('sensitive_data', OLD.id, 'DELETE', OLD.data);
    END;
  `;
}
```
