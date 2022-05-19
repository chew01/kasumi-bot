import BetterSQLite3 from 'better-sqlite3';
import initializeDB from './initializeDB';

export default class Database {
  private static path: string = './bot.db';

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
  }
}
