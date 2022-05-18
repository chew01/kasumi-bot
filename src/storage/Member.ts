import Database from './Database';
import Logger from '../services/Logger';

export default class Member {
  public static initialise(user_id: string) {
    try {
      Database.execute('INSERT INTO member (user_id, coin) VALUES (@user_id, 0)', { user_id });
      Database.execute('INSERT INTO work_data (user_id, last_daily, daily_streak, last_fish, last_mine) VALUES (@user_id, 0, 0, 0, 0)', { user_id });
      return true;
    } catch (err) {
      if (err instanceof Error) Logger.error(err.message);
      return false;
    }
  }

  public static getMembers(): { user_id: string }[] | null {
    try {
      return Database.fetchAll('SELECT user_id FROM member');
    } catch (err) {
      if (err instanceof Error) Logger.error(err.message);
      return null;
    }
  }

  public static getCoin(user_id: string): number | null {
    try {
      const res = Database.fetchOne('SELECT coin from member WHERE user_id = @user_id', { user_id });
      return res.coin;
    } catch (err) {
      if (err instanceof Error) Logger.error(err.message);
      return null;
    }
  }

  public static deductCoin(user_id: string, amount: number): number | null {
    if (amount <= 0) return null;
    try {
      Database.execute('UPDATE member SET coin = coin - @amount WHERE user_id = @user_id', { user_id, amount });
      return this.getCoin(user_id);
    } catch (err) {
      if (err instanceof Error) Logger.error(err.message);
      return null;
    }
  }

  public static addCoin(user_id: string, amount: number): number | null {
    if (amount <= 0) return null;
    try {
      Database.execute('UPDATE member SET coin = coin + @amount WHERE user_id = @user_id', { user_id, amount });
      return this.getCoin(user_id);
    } catch (err) {
      if (err instanceof Error) Logger.error(err.message);
      return null;
    }
  }
}
