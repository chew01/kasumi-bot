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
  '0,1': ':AClub:758807093414854657',
  '0,2': ':2Club:758807092869595176',
  '0,3': ':3Club:758807092911669268',
  '0,4': ':4Club:758807092688715788',
  '0,5': ':5Club:758807092609286185',
  '0,6': ':6Club:758807094480338964',
  '0,7': ':7Club:758807093003681851',
  '0,8': ':8Club:758807093128986664',
  '0,9': ':9Club:758807093041561610',
  '0,10': ':10Club:758807092831453236',
  '0,11': ':JClub:758807093204746260',
  '0,12': ':QClub:758807255683956787',
  '0,13': ':KClub:758807093225979904',
  '1,1': ':ADiamond:758807093188493342',
  '1,2': ':2Diamond:758807092881522700',
  '1,3': ':3Diamond:758807092483194911',
  '1,4': ':4Diamond:758807092840366101',
  '1,5': ':5Diamond:758807093242232842',
  '1,6': ':6Diamond:758807092852949034',
  '1,7': ':7Diamond:758807093082980352',
  '1,8': ':8Diamond:758807093347614761',
  '1,9': ':9Diamond:758807093213528094',
  '1,10': ':10Diamond:758807093309341706',
  '1,11': ':JDiamond:758807093053620254',
  '1,12': ':QDiamond:758807255688282153',
  '1,13': ':KDiamond:758807093527707668',
  '2,1': ':AHeart:758807093372780604',
  '2,2': ':2Heart:758807092760674326',
  '2,3': ':3Heart:758807093154676756',
  '2,4': ':4Heart:758807092886372453',
  '2,5': ':5Heart:758807093015740456',
  '2,6': ':6Heart:758807093133312026',
  '2,7': ':7Heart:758807092802355214',
  '2,8': ':8Heart:758807093284962354',
  '2,9': ':9Heart:758807093200945192',
  '2,10': ':10Heart:758807092978384917',
  '2,11': ':JHeart:758807093095563314',
  '2,12': ':QHeart:758807255801266196',
  '2,13': ':KHeart:758807092928053300',
  '3,1': ':ASpade:758807092789641227',
  '3,2': ':2Spade:758807092827521046',
  '3,3': ':3Spade:758807092806025217',
  '3,4': ':4Spade:758807092898299964',
  '3,5': ':5Spade:758807093108146212',
  '3,6': ':6Spade:758807092831584329',
  '3,7': ':7Spade:758807092793835552',
  '3,8': ':8Spade:758807092706017282',
  '3,9': ':9Spade:758807093238169620',
  '3,10': ':10Spade:758807093188100116',
  '3,11': ':JSpade:758807092990705706',
  '3,12': ':QSpade:758807255734026240',
  '3,13': ':KSpade:758807093373042728',
  secret: ':RHiddenCard:758807255679238185',
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
    if (Blackjack.count(this.playerCards) >= Blackjack.count(this.dealerCards)) this.dealerPlay();
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
