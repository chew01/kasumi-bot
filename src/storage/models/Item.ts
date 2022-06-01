import Database from '../Database';

type ItemType = {
  item_name: string,
  role_id: string
};

type DetailedItemType = {
  item_name: string,
  role_id: string,
  key_name: string
};

export default class Item {
  public static getOne(item_name: string): ItemType | undefined {
    return Database.fetchOne('SELECT item_name, role_id FROM item_type WHERE item_name = @item_name', { item_name });
  }

  public static getAll(): DetailedItemType[] {
    return Database.fetchAll('SELECT item_name, role_id, key_name FROM item_type LEFT JOIN box b on item_type.item_name = b.box_name');
  }

  public static create(item_name: string): void {
    Database.execute('INSERT INTO item_type (item_name, role_id) VALUES (@item_name, null)', { item_name });
  }

  public static delete(item_name: string): void {
    Database.execute('DELETE FROM item_type WHERE item_name = @item_name', { item_name });
  }
}
