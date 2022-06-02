import Box, { BoxType } from '../storage/models/Box';
import MathUtils from '../utils/MathUtils';

type PrettyReward = {
  item: string,
  quantity: number,
  odds: number
};

export default class Lootbox {
  // rewardString format: item_name|quantity|probability,item_name|quantity|probability
  public static parseReward(rewardStr: string): string[][] {
    const arr = rewardStr.split(',');
    return arr.map((itemStr) => itemStr.split('|'));
  }

  public static stringifyReward(rewards: string[][]): string {
    return rewards.map((strArr) => strArr.join('|')).join(',');
  }

  public static addReward(
    box_name: string,
    rewardStr: string,
    item: string,
    qty: number,
    odd: number,
  ): void {
    const parsed = this.parseReward(rewardStr);

    if (parsed[0] && !parsed[0][0]) {
      parsed[0] = [item, `${qty}`, `${odd}`];
      const newString = this.stringifyReward(parsed);
      Box.setRewards(box_name, newString);
      return;
    }

    parsed.push([item, `${qty}`, `${odd}`]);
    const newString = this.stringifyReward(parsed);
    Box.setRewards(box_name, newString);
  }

  public static removeReward(box_name: string, rewardStr: string, index: number): boolean {
    const parsed = this.parseReward(rewardStr);
    if (!parsed[index]) return false;

    parsed.splice(index, 1);
    const newString = this.stringifyReward(parsed);
    Box.setRewards(box_name, newString);
    return true;
  }

  public static prettifyReward(rewardStr: string): PrettyReward[] | null {
    const parsed = this.parseReward(rewardStr);

    return parsed.map((reward) => {
      const item = reward[0] || 'Error';
      const quantity = Number(reward[1]);
      const odds = Number(reward[2]);
      return { item, quantity, odds };
    });
  }

  public static use(box: BoxType): { coins: number, rewards: { item: string, qty: number }[] } {
    const coins = MathUtils.randomInRange(box.coin_minimum, box.coin_maximum);
    const parsed = this.parseReward(box.rewards);
    const rewards: { item: string, qty: number }[] = [];

    parsed.forEach((reward) => {
      const item = reward[0];
      const qty = reward[1];
      const odds = reward[2];
      if (item && qty && odds) {
        if (Number(odds) > Math.floor(Math.random() * 100)) {
          rewards.push({ item, qty: Number(qty) });
        }
      }
    });

    return { coins, rewards };
  }
}
