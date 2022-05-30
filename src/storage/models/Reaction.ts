import Database from '../Database';

export type ReactionType = {
  id: string,
  url: string,
  type: string,
};

export default class Reaction {
  public static getAll(): ReactionType[] {
    return Database.fetchAll('SELECT id, type, url FROM reaction');
  }

  public static add(id: string, type: string, url: string): void {
    Database.execute('INSERT INTO reaction (id, type, url) VALUES (@id, @type, @url)', { id, type, url });
  }

  public static remove(id: string): void {
    Database.execute('DELETE FROM reaction WHERE id = @id', { id });
  }
}
