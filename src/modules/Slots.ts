export default class Slots {
  private slots: string[] = [];

  private weightage = [0.05, 0.15, 0.2, 0.2, 0.4];

  private results = ['<:luckyseven:976209029003083796>', '🍋', '🍇', '🍒', '🫐'];

  private multiplier = [20, 12, 8, 4, 2];

  constructor() {
    for (let i = 0; i < 9; i += 1) {
      const res = Slots.getRandom(this.results, this.weightage);
      if (!res) return;
      this.slots.push(res);
    }
  }

  private static getRandom(elements: string[], probability: number[]) {
    const rand = Math.random();
    let sum = 0;

    for (let i = 0; i < elements.length - 1; i += 1) {
      const prob = probability[i];
      if (!prob) return undefined;
      sum += prob;
      if (rand < sum) {
        return elements[i];
      }
    }
    return elements[elements.length - 1];
  }

  public get() {
    return this.slots;
  }

  public checkWin() {
    if (this.slots[3] !== this.slots[4] || this.slots[4] !== this.slots[5]) return null;
    for (let i = 0; i < this.results.length; i += 1) {
      if (this.slots[1] === this.results[i]) return this.multiplier[i];
    }
    return null;
  }
}
