import Database from './Database';
import Logger from '../services/Logger';

export default class Item {
  public static getOne(item_name: string): { item_name: string, role_id: string | undefined } | null | undefined {
    try {
      return Database.fetchOne('SELECT item_name, role_id FROM item_type WHERE item_name = @item_name', { item_name });
    } catch (err) {
      if (err instanceof Error) Logger.error(err.message);
      return null;
    }
  }
}
