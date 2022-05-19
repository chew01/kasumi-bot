import Database from '../Database';

type ItemType = {
  item_name: string,
  role_id: string
};

export default class Item {
  public static getOne(item_name: string): ItemType | undefined {
    return Database.fetchOne('SELECT item_name, role_id FROM item_type WHERE item_name = @item_name', { item_name });
  }
}
