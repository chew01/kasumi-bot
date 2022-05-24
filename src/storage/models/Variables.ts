import Database from '../Database';

export default class Variables {
  public static registerTicketCategory(category_id: string): void {
    Database.execute(
      `INSERT INTO variable (key, value) 
              VALUES (@key, @category_id) 
              ON CONFLICT DO UPDATE SET value = excluded.value`,
      { key: 'ticket_category', category_id },
    );
  }

  public static getTicketCategory(): string | undefined {
    const res = Database.fetchOne('SELECT value FROM variable WHERE key = @key', { key: 'ticket_category' });
    return res ? res.value : undefined;
  }

  public static registerTicketModRole(role_id: string): void {
    Database.execute(
      `INSERT INTO variable (key, value) 
              VALUES (@key, @role_id) 
              ON CONFLICT DO UPDATE SET value = excluded.value`,
      { key: 'ticket_mod_role', role_id },
    );
  }

  public static getTicketModRole(): string | undefined {
    const res = Database.fetchOne('SELECT value FROM variable WHERE key = @key', { key: 'ticket_mod_role' });
    return res ? res.value : undefined;
  }
}
