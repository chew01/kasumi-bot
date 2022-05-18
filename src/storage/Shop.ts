import Database from './Database';
import Logger from '../services/Logger';
import Member from './Member';

export default class Shop {
  public static getAll(): { item_name: string, price: number, role_id: string | undefined }[] | null {
    try {
      return Database.fetchAll('SELECT it.item_name, price, role_id FROM shop_listing JOIN item_type it on shop_listing.item_name = it.item_name');
    } catch (err) {
      if (err instanceof Error) Logger.error(err.message);
      return null;
    }
  }

  public static checkExists(item_name: string) {
    try {
      return Database.fetchOne('SELECT 1 FROM shop_listing WHERE item_name = @item_name', { item_name });
    } catch (err) {
      if (err instanceof Error) Logger.error(err.message);
      return null;
    }
  }

  public static checkPrice(item_name: string): number | null {
    try {
      const item = Database.fetchOne('SELECT price FROM shop_listing WHERE item_name = @item_name', { item_name });
      return item.price;
    } catch (err) {
      if (err instanceof Error) Logger.error(err.message);
      return null;
    }
  }

  public static buyItem(user_id: string, item_name: string, quantity: number) {
    try {
      const bal = Member.getCoin(user_id);
      const price = Shop.checkPrice(item_name);
      if (bal === null || price === null || bal < (price * quantity)) return false;

      const total = price * quantity;

      const stmt = [
        `INSERT INTO member_inventory (user_id, item_name, quantity) 
        VALUES (@user_id, @item_name, @quantity) 
        ON CONFLICT (user_id, item_name)
            DO UPDATE SET quantity = quantity + excluded.quantity`,
        `UPDATE member
        SET coin = coin - @total
        WHERE user_id = @user_id`,
      ];

      const txn = Database.transact(stmt);
      txn({
        user_id, item_name, quantity, total,
      });
      return true;
    } catch (err) {
      if (err instanceof Error) Logger.error(err.message);
      return null;
    }
  }

  public static buyRole(user_id: string, role_name: string) {
    try {
      const bal = Member.getCoin(user_id);
      const price = Shop.checkPrice(role_name);
      if (bal === null || price === null || bal < price) return false;

      Database.execute('UPDATE member SET coin = coin - @price WHERE user_id = @user_id', { price, user_id });
      return true;
    } catch (err) {
      if (err instanceof Error) Logger.error(err.message);
      return null;
    }
  }

  public static addRole(role_name: string, role_id: string, price: number) {
    try {
      Database.execute('INSERT INTO item_type (item_name, role_id) VALUES (@role_name, @role_id)', { role_name, role_id });
      Database.execute('INSERT INTO shop_listing (item_name, price) VALUES (@role_name, @price)', { role_name, price });
      return true;
    } catch (err) {
      if (err instanceof Error) Logger.error(err.message);
      return false;
    }
  }

  public static removeRole(role_id: string) {
    try {
      Database.execute('DELETE FROM item_type WHERE role_id = @role_id', { role_id });
      return true;
    } catch (err) {
      if (err instanceof Error) Logger.error(err.message);
      return false;
    }
  }

  public static addItem(item_name: string, price: number) {
    try {
      Database.execute('INSERT INTO shop_listing (item_name, price) VALUES (@item_name, @price)', { item_name, price });
      return true;
    } catch (err) {
      if (err instanceof Error) Logger.error(err.message);
      return false;
    }
  }

  public static removeItem(item_name: string) {
    try {
      Database.execute('DELETE FROM shop_listing WHERE item_name = @item_name', { item_name });
      return true;
    } catch (err) {
      if (err instanceof Error) Logger.error(err.message);
      return false;
    }
  }
}
