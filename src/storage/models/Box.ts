import Database from '../Database';
import Item from './Item';

export type BoxType = {
  box_name: string,
  key_name: string,
  coin_minimum: number,
  coin_maximum: number,
  rewards: string
};

export default class Box {
  public static getOne(box_name: string): BoxType | undefined {
    return Database.fetchOne('SELECT box_name, key_name, coin_minimum, coin_maximum, rewards FROM box WHERE box_name = @box_name', { box_name });
  }

  public static create(box_name: string, key_name: string): void {
    Item.create(box_name);
    Item.create(key_name);
    Database.execute(`INSERT INTO box (box_name, key_name, coin_minimum, coin_maximum, rewards) 
                            VALUES (@box_name, @key_name, 0, 0, @rewards)`, { box_name, key_name, rewards: '' });
  }

  public static delete(box_name: string): void {
    const res = this.getOne(box_name);
    if (res) {
      Item.delete(res.box_name);
      Item.delete(res.key_name);
    }
  }

  public static setRewards(box_name: string, reward_string: string): void {
    Database.execute('UPDATE box SET rewards = @reward_string WHERE box_name = @box_name', { box_name, reward_string });
  }

  public static setCoin(box_name: string, minimum: number, maximum: number): void {
    Database.execute('UPDATE box SET coin_minimum = @minimum, coin_maximum = @maximum WHERE box_name = @box_name', { box_name, minimum, maximum });
  }
}
