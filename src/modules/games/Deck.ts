import _ from 'lodash';

export enum Suit {
  Club,
  Diamond,
  Heart,
  Spade,
}

export enum Rank {
  Ace = 1,
  Two,
  Three,
  Four,
  Five,
  Six,
  Seven,
  Eight,
  Nine,
  Ten,
  Jack,
  Queen,
  King,
}

export interface Card {
  suit: Suit,
  rank: Rank
}

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
