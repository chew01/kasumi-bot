import Database from '../Database';

export default class ActivityChannel {
  public static getChannelIds(): string[] {
    const res = Database.fetchAll('SELECT channel_id FROM activity_channel');
    return res.map((obj) => obj.channel_id);
  }

  public static add(channel_id: string): void {
    Database.execute('INSERT INTO activity_channel (channel_id) VALUES (@channel_id)', { channel_id });
  }

  public static remove(channel_id: string): void {
    Database.execute('DELETE FROM activity_channel WHERE channel_id = @channel_id', { channel_id });
  }
}
