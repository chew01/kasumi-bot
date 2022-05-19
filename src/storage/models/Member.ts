import Database from '../Database';

export default class Member {
  public static initialise(user_id: string): void {
    Database.execute('INSERT INTO member (user_id, coin) VALUES (@user_id, 0)', { user_id });
    Database.execute('INSERT INTO work_data (user_id, last_daily, daily_streak, last_fish, last_mine) VALUES (@user_id, 0, 0, 0, 0)', { user_id });
  }

  public static getMemberIds(): string[] {
    const res = Database.fetchAll('SELECT user_id FROM member');
    return res.map((obj) => obj.user_id);
  }

  public static getBalance(user_id: string): number {
    const res = Database.fetchOne('SELECT coin FROM member WHERE user_id = @user_id', { user_id });
    return res.coin;
  }

  public static deductMoney(user_id: string, amount: number): number {
    if (amount > 0) Database.execute('UPDATE member SET coin = coin - @amount WHERE user_id = @user_id', { user_id, amount });
    return this.getBalance(user_id);
  }

  public static addMoney(user_id: string, amount: number): number {
    if (amount > 0) Database.execute('UPDATE member SET coin = coin + @amount WHERE user_id = @user_id', { user_id, amount });
    return this.getBalance(user_id);
  }
}
