import Database from '../Database';

export type BadWordType = {
  word: string,
  user_id: string
};

export default class BadWord {
  public static getAll(): BadWordType[] {
    return Database.fetchAll('SELECT word, user_id FROM bad_word');
  }

  public static add(word: string, user_id: string): void {
    Database.execute('INSERT INTO bad_word (word, user_id) VALUES (@word, @user_id)', { word, user_id });
  }

  public static remove(word: string): void {
    Database.execute('DELETE FROM bad_word WHERE word = @word', { word });
  }
}
