import Database from '../Database';

type GiveawayData = {
  message_id: string,
  channel_id: string,
  draw: number,
  prize: string,
  host: string
};

export default class Giveaway {
  public static getAll(): GiveawayData[] {
    return Database.fetchAll('SELECT message_id, channel_id, draw, prize, host FROM giveaway');
  }

  public static getOne(message_id: string): GiveawayData {
    return Database.fetchOne('SELECT message_id, channel_id, draw, prize, host FROM giveaway WHERE message_id = @message_id', { message_id });
  }

  public static create(
    message_id: string,
    channel_id: string,
    draw: number,
    prize: string,
    host: string,
  ): void {
    Database.execute(
      `INSERT INTO giveaway (message_id, channel_id, draw, prize, host) 
            VALUES (@message_id, @channel_id, @draw, @prize, @host)`,
      {
        message_id, channel_id, draw, prize, host,
      },
    );
  }

  public static delete(message_id: string):void {
    Database.execute('DELETE FROM giveaway WHERE message_id = @message_id', { message_id });
  }
}
