import Database from '../Database';

export default class Star {
  public static getBoardId(starred_id: string): string | undefined {
    const res = Database.fetchOne('SELECT board_id FROM star WHERE starred_id = @starred_id', { starred_id });
    return res ? res.board_id : undefined;
  }

  public static add(starred_id: string, board_id: string): void {
    Database.execute('INSERT INTO star (starred_id, board_id) VALUES (@starred_id, @board_id)', { starred_id, board_id });
  }

  public static remove(board_id: string): void {
    Database.execute('DELETE FROM star WHERE board_id = @board_id', { board_id });
  }
}
