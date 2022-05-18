import Config from '../Config';

export default class CurrencyUtils {
  public static format(amount: number) {
    if (!Config.CURRENCY_NAME || !Config.CURRENCY_NAME_PLURAL) throw new Error('Using currency function without specifying currency name!');
    if (amount === 1) return `1 ${Config.CURRENCY_NAME}`;

    const num = amount.toString().replace(/\B(?<!\.\d*)(?=(\d{3})+(?!\d))/g, ',');
    return `${num} ${Config.CURRENCY_NAME_PLURAL}`;
  }

  public static formatEmoji(amount: number) {
    if (amount === 1) return `${this.format(amount)}<a:coin:976107569942769684>`;

    return `${this.format(amount)}<a:coins:976105693767684177>`;
  }
}
