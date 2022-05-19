import Database from '../Database';
import Member from './Member';
import type { InventoryType } from './Inventory';

export default class Shop {
  public static getListings(): InventoryType[] {
    return Database.fetchAll('SELECT it.item_name, price, role_id FROM shop_listing JOIN item_type it on shop_listing.item_name = it.item_name');
  }

  public static has(item_name: string): boolean {
    return !!Database.fetchOne('SELECT 1 FROM shop_listing WHERE item_name = @item_name', { item_name });
  }

  public static getPrice(item_name: string): number {
    const item = Database.fetchOne('SELECT price FROM shop_listing WHERE item_name = @item_name', { item_name });
    return item ? item.price : -1;
  }

  public static addRole(role_name: string, role_id: string, price: number): void {
    Database.execute('INSERT INTO item_type (item_name, role_id) VALUES (@role_name, @role_id)', { role_name, role_id });
    Database.execute('INSERT INTO shop_listing (item_name, price) VALUES (@role_name, @price)', { role_name, price });
  }

  public static removeRole(role_id: string): void {
    Database.execute('DELETE FROM item_type WHERE role_id = @role_id', { role_id });
  }

  public static addItem(item_name: string, price: number): void {
    Database.execute('INSERT INTO shop_listing (item_name, price) VALUES (@item_name, @price)', { item_name, price });
  }

  public static removeItem(item_name: string): void {
    Database.execute('DELETE FROM shop_listing WHERE item_name = @item_name', { item_name });
  }

  public static buyItem(user_id: string, item_name: string, quantity: number): boolean {
    const bal = Member.getBalance(user_id);
    const price = Shop.getPrice(item_name);
    if (bal < (price * quantity)) return false;

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
      user_id,
      item_name,
      quantity,
      total,
    });
    return true;
  }

  public static buyRole(user_id: string, role_name: string): boolean {
    const bal = Member.getBalance(user_id);
    const price = Shop.getPrice(role_name);
    if (bal < price) return false;

    Database.execute('UPDATE member SET coin = coin - @price WHERE user_id = @user_id', { price, user_id });
    return true;
  }
}
