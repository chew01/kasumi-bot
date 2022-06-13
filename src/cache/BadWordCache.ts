import Filter from 'bad-words';
import BadWord, { BadWordType } from '../storage/models/BadWord';

class BadWordCache {
  private readonly list: BadWordType[];

  private readonly filter: Filter;

  public constructor() {
    this.list = BadWord.getAll();
    this.filter = new Filter({ emptyList: true });
    this.filter.addWords(...this.list.map((bw) => bw.word));
  }

  public check(str: string): boolean {
    return this.filter.isProfane(str);
  }

  public add(word: string, user_id: string): boolean {
    if (this.list.map((bw) => bw.word).includes(word)) return false;
    BadWord.add(word, user_id);
    this.list.push({ word, user_id });
    this.filter.addWords(word);
    return true;
  }

  public remove(word: string): boolean {
    if (!this.list.map((bw) => bw.word).includes(word)) return false;
    BadWord.remove(word);
    const index = this.list.map((bw) => bw.word).indexOf(word);
    this.list.splice(index, 1);
    this.filter.removeWords(word);
    return true;
  }

  public getList(): BadWordType[] {
    return this.list;
  }
}

export default new BadWordCache();
