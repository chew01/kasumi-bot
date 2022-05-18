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
