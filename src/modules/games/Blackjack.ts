import Deck, { Card, Rank } from './Deck';

type WinnerType = 'PlayerBust' | 'DealerBust' | 'Player' | 'Dealer' | 'Draw' | 'None';

type StartingHands = {
  playerCards: Card[],
  dealerCards: Card[],
  playerStartingCount: number,
  dealerStartingCount: number,
};

type BlackjackData = {
  winner: WinnerType,
  playerCards: Card[],
  dealerCards: Card[],
  playerCount: number,
  dealerCount: number,
};

export const cards = {
  '0,1': ':AClub:1006906953290756187',
  '0,2': ':2Club:1006906841562873877',
  '0,3': ':3Club:1006906849997635624',
  '0,4': ':4Club:1006906858856005692',
  '0,5': ':5Club:1006906867169108028',
  '0,6': ':6Club:1006906875306070046',
  '0,7': ':7Club:1006906884583866478',
  '0,8': ':8Club:1006906892506890372',
  '0,9': ':9Club:1006906900815810661',
  '0,10': ':10Club:1006906944952483971',
  '0,11': ':JClub:1006907004972978237',
  '0,12': ':QClub:1006907021825683506',
  '0,13': ':KClub:1006907013361582150',
  '1,1': ':ADiamond:1006906955207561356',
  '1,2': ':2Diamond:1006906844033327124',
  '1,3': ':3Diamond:1006906852690362400',
  '1,4': ':4Diamond:1006906860818927648',
  '1,5': ':5Diamond:1006906869496942692',
  '1,6': ':6Diamond:1006906877776494683',
  '1,7': ':7Diamond:1006906886580342884',
  '1,8': ':8Diamond:1006906894536941599',
  '1,9': ':9Diamond:1006906902933938196',
  '1,10': ':10Diamond:1006906947141910568',
  '1,11': ':JDiamond:1006907006986223708',
  '1,12': ':QDiamond:1006907024119971950',
  '1,13': ':KDiamond:1006907015697801328',
  '2,1': ':AHeart:1006906957283741716',
  '2,2': ':2Heart:1006906845975302144',
  '2,3': ':3Heart:1006906854766555136',
  '2,4': ':4Heart:1006906863096451213',
  '2,5': ':5Heart:1006906871497621594',
  '2,6': ':6Heart:1006906880108539934',
  '2,7': ':7Heart:1006906888463585380',
  '2,8': ':8Heart:1006906896885755924',
  '2,9': ':9Heart:1006906904519385140',
  '2,10': ':10Heart:1006906949213884446',
  '2,11': ':JHeart:1006907009146302524',
  '2,12': ':QHeart:1006924144723636325',
  '2,13': ':KHeart:1006907017463615560',
  '3,1': ':ASpade:1006906959691259904',
  '3,2': ':2Spade:1006906848022102048',
  '3,3': ':3Spade:1006906856767225896',
  '3,4': ':4Spade:1006906865017430057',
  '3,5': ':5Spade:1006906873347325992',
  '3,6': ':6Spade:1006906882243448943',
  '3,7': ':7Spade:1006906890372010146',
  '3,8': ':8Spade:1006906898831900835',
  '3,9': ':9Spade:1006906906587176970',
  '3,10': ':10Spade:1006906951424282654',
  '3,11': ':JSpade:1006907011386048512',
  '3,12': ':QSpade:1006924146732695622',
  '3,13': ':KSpade:1006907019304906813',
  secret: ':Hidden:1006924163300196362',
};

export default class Blackjack {
  private cards: Card[];

  private playerCards: Card[] = [];

  private dealerCards: Card[] = [];

  private winner: WinnerType = 'None';

  constructor() {
    this.cards = new Deck().get();
  }

  public playerDraw(): void {
    const card = this.cards.pop();
    if (!card) throw new Error('Player drew empty card!');
    this.playerCards.push(card);
    this.checkBust();
  }

  public dealerDraw(): void {
    const card = this.cards.pop();
    if (!card) throw new Error('Dealer drew empty card!');
    this.dealerCards.push(card);
    this.checkBust();
  }

  private static count(hand: Card[]): number {
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

  private static countOne(hand: Card[]): number {
    if (!hand[0]) return 0;
    if ([Rank.Ten, Rank.Jack, Rank.Queen, Rank.King].includes(hand[0].rank)) return 10;
    if (hand[0].rank === Rank.Ace) return 11;
    return hand[0].rank;
  }

  public start(): StartingHands {
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

  private calculate(): void {
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

  public checkNatural(): WinnerType {
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

  private checkBust(): void {
    if (Blackjack.count(this.playerCards) > 21) this.winner = 'PlayerBust';
    if (Blackjack.count(this.dealerCards) > 21) this.winner = 'DealerBust';
  }

  private hitNatural(): void {
    this.dealerPlay();
    if (Blackjack.count(this.dealerCards) === 21) {
      this.winner = 'Draw';
      return;
    }
    this.winner = 'Player';
  }

  private dealerPlay(): void {
    while (Blackjack.count(this.dealerCards) < 17) {
      this.dealerDraw();
    }
  }

  public playerHit(): void {
    this.playerDraw();
    if (Blackjack.count(this.playerCards) === 21) this.hitNatural();
  }

  public playerStand(): void {
    this.dealerPlay();
    if (this.winner === 'None') this.calculate();
  }

  public playerDouble(): void {
    this.playerDraw();
    if (Blackjack.count(this.playerCards) === 21) this.hitNatural();
    if (Blackjack.count(this.playerCards) < 21 && this.winner === 'None') this.dealerPlay();
    if (this.winner === 'None') this.calculate();
  }

  public getData(): BlackjackData {
    return {
      winner: this.winner,
      playerCards: this.playerCards,
      dealerCards: this.dealerCards,
      playerCount: Blackjack.count(this.playerCards),
      dealerCount: Blackjack.count(this.dealerCards),
    };
  }
}
