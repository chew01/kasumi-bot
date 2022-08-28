import BetterSQLite3 from 'better-sqlite3';
import initializeDB from './initializeDB';

export default class Database {
  private static path: string = 'database/bot.db';

  public static connect(): BetterSQLite3.Database {
    return BetterSQLite3(Database.path);
  }

  public static execute(stmt: string, ...args: any[]): BetterSQLite3.RunResult {
    const conn = this.connect();
    const res = conn.prepare(stmt).run(...args);
    conn.close();
    return res;
  }

  public static transact(stmt: string[]): BetterSQLite3.Transaction {
    const conn = this.connect();
    const statements = stmt.map((sql) => conn.prepare(sql));
    return conn.transaction((args) => {
      statements.forEach((sql) => sql.run(args));
    });
  }

  public static fetchOne(stmt: string, ...args: any[]): any {
    const conn = this.connect();
    const res = conn.prepare(stmt).get(...args);
    conn.close();
    return res;
  }

  public static fetchAll(stmt: string, ...args: any[]): any[] {
    const conn = this.connect();
    const res = conn.prepare(stmt).all(...args);
    conn.close();
    return res;
  }

  public static initialize(): void {
    const conn = this.connect();
    const statements = initializeDB.map((stmt) => conn.prepare(stmt));
    statements.forEach((stmt) => stmt.run());

    Database.execute('INSERT INTO item_type (item_name, role_id) VALUES (@item_name, null) ON CONFLICT DO NOTHING', { item_name: 'Chat Loot Box' });
    Database.execute('INSERT INTO item_type (item_name, role_id) VALUES (@item_name, null) ON CONFLICT DO NOTHING', { item_name: 'Chat Loot Key' });
    Database.execute('INSERT INTO item_type (item_name, role_id) VALUES (@item_name, null) ON CONFLICT DO NOTHING', { item_name: 'Daily Loot Box' });
    Database.execute('INSERT INTO item_type (item_name, role_id) VALUES (@item_name, null) ON CONFLICT DO NOTHING', { item_name: 'Daily Loot Key' });
    Database.execute(`INSERT INTO box (box_name, key_name, coin_minimum, coin_maximum, rewards) 
                            VALUES (@box_name, @key_name, 0, 0, @rewards) ON CONFLICT DO NOTHING`, { box_name: 'Chat Loot Box', key_name: 'Chat Loot Key', rewards: '' });
    Database.execute(`INSERT INTO box (box_name, key_name, coin_minimum, coin_maximum, rewards) 
                            VALUES (@box_name, @key_name, 0, 0, @rewards) ON CONFLICT DO NOTHING`, { box_name: 'Daily Loot Box', key_name: 'Daily Loot Key', rewards: '' });
  }
}
