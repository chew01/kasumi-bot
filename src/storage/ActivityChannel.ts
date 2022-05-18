import Database from './Database';
import Logger from '../services/Logger';

export default class ActivityChannel {
  public static get(): { channel_id: string }[] | null {
    try {
      return Database.fetchAll('SELECT channel_id FROM activity_channel');
    } catch (err) {
      if (err instanceof Error) Logger.error(err.message);
      return null;
    }
  }

  public static add(channel_id: string) {
    try {
      Database.execute('INSERT INTO activity_channel (channel_id) VALUES (@channel_id)', { channel_id });
      return true;
    } catch (err) {
      if (err instanceof Error) Logger.error(err.message);
      return false;
    }
  }

  public static remove(channel_id: string) {
    try {
      Database.execute('DELETE FROM activity_channel WHERE channel_id = @channel_id', { channel_id });
      return true;
    } catch (err) {
      if (err instanceof Error) Logger.error(err.message);
      return false;
    }
  }
}
