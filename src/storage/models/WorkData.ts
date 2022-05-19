import Database from '../Database';
import Logger from '../../services/Logger';
import Config from '../../Config';

type DailyData = {
  last_daily: number,
  daily_streak: number
};

export default class WorkData {
  public static getDaily(user_id: string): DailyData {
    return Database.fetchOne('SELECT last_daily, daily_streak FROM work_data WHERE user_id = @user_id', { user_id });
  }

  public static incrementDaily(
    user_id: string,
    time: number,
    coin: number,
    options: { streak: boolean, gift?: boolean },
  ): boolean {
    // Increment streak with gift
    if (options.gift) {
      const stmt = [
        `UPDATE work_data
          SET last_daily = @time, daily_streak = daily_streak + 1
          WHERE user_id = @user_id`,
        `UPDATE member
          SET coin = coin = @coin
          WHERE user_id = @user_id`,
        `INSERT INTO member_inventory (user_id, item_name, quantity) 
          VALUES (@user_id, @reward_name, @reward_quantity)
          ON CONFLICT DO UPDATE SET quantity = quantity + @reward_quantity`,
      ];
      const txn = Database.transact(stmt);
      try {
        txn({
          user_id,
          time,
          coin,
          reward_name: Config.STREAK_REWARD_NAME,
          reward_quantity: Config.STREAK_REWARD_QUANTITY,
        });
        return true;
      } catch (err) {
        if (err instanceof Error) Logger.error(err.message);
        return false;
      }
    }

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

  public static getFish(user_id: string): number {
    const res = Database.fetchOne('SELECT last_fish FROM work_data WHERE user_id = @user_id', { user_id });
    return res.last_fish;
  }

  public static incrementFish(user_id: string, time: number, coin: number): boolean {
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

  public static getMine(user_id: string): number {
    const res = Database.fetchOne('SELECT last_mine FROM work_data WHERE user_id = @user_id', { user_id });
    return res.last_mine;
  }

  public static incrementMine(user_id: string, time: number, coin: number): boolean {
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
