import _ from 'lodash';
import type { Card } from '../types/Game';

export default class Deck {
  private readonly cards: Card[] = [];

  public constructor() {
    for (let i = 0; i < 4; i += 1) {
      for (let j = 1; j < 14; j += 1) {
        this.cards.push({ suit: i, rank: j });
      }
    }
    this.cards = _.shuffle(this.cards);
  }

  public get() {
    return this.cards;
  }
}
