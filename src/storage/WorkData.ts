import Database from './Database';
import Logger from '../services/Logger';

export default class WorkData {
  public static getDaily(user_id: string): { last_daily: number, daily_streak: number } | null {
    try {
      return Database.fetchOne('SELECT last_daily, daily_streak FROM work_data WHERE user_id = @user_id', { user_id });
    } catch (err) {
      if (err instanceof Error) Logger.error(err.message);
      return null;
    }
  }

  public static incrementDaily(user_id: string, time: number, coin: number, options: { streak: boolean, gift?: boolean }) {
    // TODO: Add 10 day streak gift

    // Increment streak
    if (options.streak) {
      const stmt = [
        `UPDATE work_data
           SET last_daily = @time, daily_streak = daily_streak + 1
           WHERE user_id = @user_id`,
        `UPDATE member
          SET coin = coin + @coin
          WHERE user_id = @user_id`,
      ];
      const txn = Database.transact(stmt);
      try {
        txn({ user_id, time, coin });
        return true;
      } catch (err) {
        if (err instanceof Error) Logger.error(err.message);
        return false;
      }
    }

    // Streak broken
    const stmt = [
      `UPDATE work_data
        SET last_daily = @time, daily_streak = 1
        WHERE user_id = @user_id`,
      `UPDATE member
        SET coin = coin + @coin
        WHERE user_id = @user_id`,
    ];
    const txn = Database.transact(stmt);
    try {
      txn({ user_id, time, coin });
      return true;
    } catch (err) {
      if (err instanceof Error) Logger.error(err.message);
      return false;
    }
  }

  public static getFish(user_id: string): { last_fish: number } | null {
    try {
      return Database.fetchOne('SELECT last_fish FROM work_data WHERE user_id = @user_id', { user_id });
    } catch (err) {
      if (err instanceof Error) Logger.error(err.message);
      return null;
    }
  }

  public static incrementFish(user_id: string, time: number, coin: number) {
    const stmt = [
      `UPDATE work_data
        SET last_fish = @time
        WHERE user_id = @user_id`,
      `UPDATE member
        SET coin = coin + @coin
        WHERE user_id = @user_id`,
    ];
    const txn = Database.transact(stmt);
    try {
      txn({ user_id, time, coin });
      return true;
    } catch (err) {
      if (err instanceof Error) Logger.error(err.message);
      return false;
    }
  }

  public static getMine(user_id: string): { last_mine: number } | null {
    try {
      return Database.fetchOne('SELECT last_mine FROM work_data WHERE user_id = @user_id', { user_id });
    } catch (err) {
      if (err instanceof Error) Logger.error(err.message);
      return null;
    }
  }

  public static incrementMine(user_id: string, time: number, coin: number) {
    const stmt = [
      `UPDATE work_data
        SET last_mine = @time
        WHERE user_id = @user_id`,
      `UPDATE member
        SET coin = coin + @coin
        WHERE user_id = @user_id`,
    ];
    const txn = Database.transact(stmt);
    try {
      txn({ user_id, time, coin });
      return true;
    } catch (err) {
      if (err instanceof Error) Logger.error(err.message);
      return false;
    }
  }
}
