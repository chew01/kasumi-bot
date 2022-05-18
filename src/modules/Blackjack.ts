import Deck from './Deck';
import type { Card } from '../types/Game';
import { Rank } from '../types/Game';

export default class Blackjack {
  private cards: Card[];

  private playerCards: Card[] = [];

  private dealerCards: Card[] = [];

  private winner: 'PlayerBust' | 'DealerBust' | 'Player' | 'Dealer' | 'Draw' | 'None' = 'None';

  constructor() {
    this.cards = new Deck().get();
  }

  public playerDraw() {
    const card = this.cards.pop();
    if (!card) throw new Error('Player drew empty card!');
    this.playerCards.push(card);
    this.checkBust();
  }

  public dealerDraw() {
    const card = this.cards.pop();
    if (!card) throw new Error('Dealer drew empty card!');
    this.dealerCards.push(card);
    this.checkBust();
  }

  private static count(hand: Card[]) {
    if (!hand[0] || !hand[1]) return 0;
    if (hand[0].rank === Rank.Ace
        && [Rank.Ten, Rank.Jack, Rank.Queen, Rank.King].includes(hand[1].rank)) return 21;

    const aces = hand.filter((card) => card.rank === Rank.Ace);
    const nonAces = hand.filter((card) => card.rank !== Rank.Ace);
    let sum = 0;

    nonAces.forEach((card) => {
      if ([Rank.Ten, Rank.Jack, Rank.Queen, Rank.King].includes(card.rank)) {
        sum += 10;
      } else {
        sum += card.rank;
      }
    });

    if (aces.length === 0) return sum;

    if (sum <= 10) {
      if (aces.length === 1) return sum + 11;
      if (sum + 11 + (aces.length - 1) <= 21) return sum + 11 + (aces.length - 1);
      return sum + aces.length;
    }

    return sum + aces.length;
  }

  private static countOne(hand: Card[]) {
    if (!hand[0]) return 0;
    if ([Rank.Ten, Rank.Jack, Rank.Queen, Rank.King].includes(hand[0].rank)) return 10;
    if (hand[0].rank === Rank.Ace) return 11;
    return hand[0].rank;
  }

  public start() {
    this.playerDraw();
    this.playerDraw();
    this.dealerDraw();
    this.dealerDraw();
    return {
      playerCards: this.playerCards,
      dealerCards: this.dealerCards,
      playerStartingCount: Blackjack.count(this.playerCards),
      dealerStartingCount: Blackjack.countOne(this.dealerCards),
    };
  }

  private forceEnd() {
    if (Blackjack.count(this.playerCards) > Blackjack.count(this.dealerCards)) {
      this.winner = 'Player';
      return;
    }
    if (Blackjack.count(this.playerCards) < Blackjack.count(this.dealerCards)) {
      this.winner = 'Dealer';
      return;
    }
    this.winner = 'Draw';
  }

  private checkBust() {
    if (Blackjack.count(this.playerCards) > 21) this.winner = 'PlayerBust';
    if (Blackjack.count(this.dealerCards) > 21) this.winner = 'DealerBust';
  }

  private hitNatural() {
    this.dealerPlay();
    if (Blackjack.count(this.dealerCards) === 21) {
      this.winner = 'Draw';
      return;
    }
    this.winner = 'Player';
  }

  private dealerPlay() {
    while (Blackjack.count(this.dealerCards) < 17) {
      this.dealerDraw();
    }
  }

  public playerHit() {
    this.playerDraw();
    if (Blackjack.count(this.playerCards) === 21) this.hitNatural();
  }

  public playerStand() {
    if (Blackjack.count(this.playerCards) >= Blackjack.count(this.dealerCards)) this.dealerPlay();
    if (this.winner === 'None') this.forceEnd();
  }

  public playerDouble() {
    this.playerDraw();
    if (Blackjack.count(this.playerCards) === 21) this.hitNatural();
    if (Blackjack.count(this.playerCards) < 21 && this.winner === 'None') this.dealerPlay();
    if (this.winner === 'None') this.forceEnd();
  }

  public getData() {
    return {
      winner: this.winner,
      playerCards: this.playerCards,
      dealerCards: this.dealerCards,
      playerCount: Blackjack.count(this.playerCards),
      dealerCount: Blackjack.count(this.dealerCards),
    };
  }

  public checkNatural() {
    if (Blackjack.count(this.playerCards) === 21 && Blackjack.count(this.dealerCards) === 21) {
      this.winner = 'Draw';
      return this.winner;
    }
    if (Blackjack.count(this.playerCards) === 21) {
      this.winner = 'Player';
      return this.winner;
    }
    return this.winner;
  }
}
