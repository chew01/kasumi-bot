import Database from '../Database';
import Item from './Item';

type BoxType = {
  box_name: string,
  key_name: string,
  rewards: string | undefined
};

export default class Box {
  public static getOne(box_name: string): BoxType | undefined {
    return Database.fetchOne('SELECT box_name, key_name, rewards FROM box WHERE box_name = @box_name', { box_name });
  }

  public static create(box_name: string, key_name: string): void {
    Item.create(box_name);
    Item.create(key_name);
    Database.execute('INSERT INTO box (box_name, key_name, rewards) VALUES (@box_name, @key_name, null)', { box_name, key_name });
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
}
