import Database from './Database';
import Logger from '../services/Logger';

type InventoryType = {
  item_name: string,
  quantity: number,
  role_id: string
};

export default class Inventory {
  public static get(user_id: string): InventoryType[] | null {
    try {
      return Database.fetchAll('SELECT it.item_name, quantity, role_id FROM member_inventory JOIN item_type it on member_inventory.item_name = it.item_name WHERE user_id = @user_id', { user_id });
    } catch (err) {
      if (err instanceof Error) Logger.error(err.message);
      return null;
    }
  }

  public static checkIfOwns(user_id: string, item_name: string) {
    try {
      const check = Database.fetchOne('SELECT 1 FROM member_inventory WHERE user_id = @user_id AND item_name = @item_name', { user_id, item_name });
      return !!check;
    } catch (err) {
      if (err instanceof Error) Logger.error(err.message);
      return null;
    }
  }

  public static checkQuantityOwned(user_id:string, item_name: string, quantity: number) {
    try {
      const check = Database.fetchOne('SELECT quantity FROM member_inventory WHERE user_id = @user_id AND item_name = @item_name', { user_id, item_name });
      if (!check) return false;
      return check.quantity >= quantity;
    } catch (err) {
      if (err instanceof Error) Logger.error(err.message);
      return null;
    }
  }

  public static trade(init_id: string, init_item: string, init_qty: number, target_id: string, target_item: string, target_qty: number) {
    try {
      const checkInit = this.checkQuantityOwned(init_id, init_item, init_qty);
      const checkTarget = this.checkQuantityOwned(target_id, target_item, target_qty);
      if (!checkInit || !checkTarget) return false;

      const stmt = [
        `UPDATE member_inventory
          SET quantity = quantity - @init_qty
          WHERE user_id = @init_id AND item_name = @init_item`,
        `UPDATE member_inventory
          SET quantity = quantity - @target_qty
          WHERE user_id = @target_id AND item_name = @target_item`,
        `INSERT INTO member_inventory (user_id, item_name, quantity)
            VALUES (@init_id, @target_item, @target_qty)
            ON CONFLICT DO UPDATE SET quantity = quantity + excluded.quantity`,
        `INSERT INTO member_inventory (user_id, item_name, quantity)
            VALUES (@target_id, @init_item, @init_qty)
            ON CONFLICT DO UPDATE SET quantity = quantity + excluded.quantity`,
      ];

      const txn = Database.transact(stmt);
      txn({
        init_id, init_item, init_qty, target_id, target_item, target_qty,
      });

      return true;
    } catch (err) {
      if (err instanceof Error) Logger.error(err.message);
      return null;
    }
  }
}
