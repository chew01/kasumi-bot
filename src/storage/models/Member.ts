import Database from '../Database';
import MathUtils from '../../utils/MathUtils';

export type LevelDataType = {
  previousLevel: number,
  level: number,
  totalExp: number,
  currentExp: number,
  nextLevelExp: number,
};

type LeaderboardFetchType = {
  user_id: string,
  experience: number,
  level: number,
  exp_rank: number
};

type LeaderboardRowType = {
  user_id: string,
  level: number,
  currentExp: number,
  nextLevelExp: number,
  exp_rank: number
};

export type LeaderboardType = {
  topRows: LeaderboardRowType[],
  userRow: LeaderboardRowType
};

export default class Member {
  public static initialise(user_id: string): void {
    Database.execute('INSERT INTO member (user_id, coin, experience, level) VALUES (@user_id, 0, 0, 1)', { user_id });
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

  public static getExperience(user_id: string): LevelDataType {
    const res = Database.fetchOne('SELECT experience, level FROM member WHERE user_id = @user_id', { user_id });
    const totalExp = res.experience;
    const previousLevel = res.level;

    if (totalExp < 1600) {
      return {
        previousLevel: 1, level: 1, totalExp, currentExp: totalExp, nextLevelExp: 1600,
      };
    }

    const level = 0.05 * Math.floor(Math.sqrt(totalExp));
    const currentExp = totalExp - MathUtils.formatExperience(level);
    const nextLevelExp = MathUtils.formatExperience(level + 1) - MathUtils.formatExperience(level);

    if (previousLevel < level) this.incrementLevel(user_id);

    return {
      previousLevel, level, totalExp, currentExp, nextLevelExp,
    };
  }

  public static addExperience(user_id: string, amount: number): LevelDataType {
    if (amount > 0) Database.execute('UPDATE member SET experience = experience + @amount WHERE user_id = @user_id', { user_id, amount });
    return this.getExperience(user_id);
  }

  public static incrementLevel(user_id: string): void {
    Database.execute('UPDATE member SET level = level + 1 WHERE user_id = @user_id', { user_id });
  }

  public static getLeaderboard(user_id: string): LeaderboardType {
    const rows: LeaderboardFetchType[] = Database.fetchAll('SELECT user_id, experience, level, RANK() OVER ( ORDER BY experience DESC ) exp_rank FROM member');
    const user = rows.find((row) => row.user_id === user_id);
    if (!user) throw new Error(`User ${user_id} tried to fetch rank data but did not find entry!`);
    const topRows: LeaderboardRowType[] = rows.slice(0, 50).map((row) => {
      const currentExp = row.experience - MathUtils.formatExperience(row.level);
      const nextLevelExp = MathUtils.formatExperience(row.level + 1)
          - MathUtils.formatExperience(row.level);

      if (row.experience < 1600) {
        return {
          user_id: row.user_id,
          level: 1,
          currentExp: row.experience,
          nextLevelExp: 1600,
          exp_rank: row.exp_rank,
        };
      }
      return {
        user_id: row.user_id,
        level: row.level,
        currentExp,
        nextLevelExp,
        exp_rank: row.exp_rank,
      };
    });

    let userRow: LeaderboardRowType;
    const currentExp = user.experience - MathUtils.formatExperience(user.level);
    const nextLevelExp = MathUtils.formatExperience(user.level + 1)
        - MathUtils.formatExperience(user.level);

    if (user.experience < 1600) {
      userRow = {
        user_id: user.user_id,
        level: 1,
        currentExp: user.experience,
        nextLevelExp: 1600,
        exp_rank: user.exp_rank,
      };
    } else {
      userRow = {
        user_id: user.user_id,
        level: user.level,
        currentExp,
        nextLevelExp,
        exp_rank: user.exp_rank,
      };
    }

    return { topRows, userRow };
  }
}
