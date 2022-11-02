import Database from '../Database';

export default class Anilist {
  public static getAll(): number[] {
    return Database.fetchAll('SELECT media_id FROM anilist').map((entry) => entry.media_id);
  }

  public static add(media_id: number): void {
    Database.execute('INSERT INTO anilist VALUES (@media_id)', { media_id });
  }

  public static remove(media_id: number): void {
    Database.execute('DELETE FROM anilist WHERE media_id = @media_id', { media_id });
  }
}
