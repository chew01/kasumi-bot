import { v4 as uuidv4 } from 'uuid';
import Reaction from '../storage/models/Reaction';

type ReactionData = {
  id: string,
  url: string
};

class ReactionCache {
  private readonly reactions: Map<string, ReactionData[]>;

  public constructor() {
    this.reactions = new Map<string, ReactionData[]>();
    const stored = Reaction.getAll();
    if (stored) {
      stored.forEach((rxn) => {
        const existing = this.reactions.get(rxn.type);
        if (existing) this.reactions.set(rxn.type, [...existing, { id: rxn.id, url: rxn.url }]);
        else this.reactions.set(rxn.type, [{ id: rxn.id, url: rxn.url }]);
      });
    }
  }

  public getTypes(): string[] {
    return Array.from(this.reactions.keys());
  }

  public getRandom(type: string): ReactionData | undefined {
    const data = this.reactions.get(type);
    if (!data) return undefined;

    return data[Math.floor(Math.random() * data.length)];
  }

  public addUrl(type: string, url: string): boolean {
    const data = this.reactions.get(type);
    if (data && data.some((item) => item.url === url)) return false;

    const id = uuidv4();

    if (!data) {
      Reaction.add(id, type, url);
      this.reactions.set(type, [{ id, url }]);
      return true;
    }

    Reaction.add(id, type, url);
    this.reactions.set(type, [...data, { id, url }]);
    return true;
  }

  public delId(id: string): boolean {
    const entries = Array.from(this.reactions.entries());
    const array = entries.filter((arr) => arr[1].some((item) => item.id === id));
    if (!array[0]) return false;
    const data = this.reactions.get(array[0][0]);
    if (!data) return false;

    const idx = data.findIndex((item) => item.id === id);
    if (idx === -1) return false;

    data.splice(idx, 1);
    Reaction.remove(id);

    if (data.length === 0) this.reactions.delete(array[0][0]);
    return true;
  }
}

export default new ReactionCache();
