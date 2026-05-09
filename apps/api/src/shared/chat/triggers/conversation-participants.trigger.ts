import {
  AbstractTrigger,
  TriggerApply,
} from 'src/shared/database/interfaces/database-trigger.interface';

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
              THEN CONCAT(CONCAT(UPPER(LEFT(u.firstName, 1)), SUBSTRING(u.firstName, 2)), ' ', CONCAT(UPPER(LEFT(u.lastName, 1)), SUBSTRING(u.lastName, 2)))
              WHEN u.username IS NOT NULL THEN u.username
              ELSE 'unknown'
            END
            SEPARATOR ','
          )
          FROM conversations_participants_users cp
          INNER JOIN users u
            ON u.id = cp.usersId
          WHERE cp.conversationsId = ${conversationIdExpr}`;
  }

  createTriggerSql(apply: TriggerApply, triggerName: string): string {
    if (apply.table === 'conversations_participants_users') {
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

    // users table: update all conversations this user participates in
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
