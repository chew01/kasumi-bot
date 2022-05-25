import Config from '../Config';

class AntiRaid {
  private readonly messageStore: Map<string, number>;

  public constructor() {
    this.messageStore = new Map<string, number>();
  }

  public add(str: string): number {
    const count = this.messageStore.get(str);
    if (count) this.messageStore.set(str, count + 1);
    if (!count) this.messageStore.set(str, 1);

    setTimeout(() => {
      const newCount = this.messageStore.get(str);
      if (newCount === 1) this.messageStore.delete(str);
      else if (newCount) this.messageStore.set(str, newCount - 1);
    }, Config.ANTIRAID_LOGEXPIRY);

    return this.messageStore.get(str) || 0;
  }
}

export default new AntiRaid();
