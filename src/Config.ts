import 'dotenv/config';
import type { GatewayIntentsString } from 'discord.js';

const GatewayIntents = require('../config/gatewayIntents.json');
const Income = require('../config/income.json');

class Config {
  private static populateConfig() {
    if (!process.env['DISCORD_TOKEN']) throw new Error('No bot token was provided!');
    const {
      DISCORD_TOKEN, GUILD_ID, CURRENCY_NAME, CURRENCY_NAME_PLURAL,
    } = process.env;

    const encryptedClientId = DISCORD_TOKEN.split('.')[0];
    if (!encryptedClientId) throw new Error('Invalid bot token!');
    const BOT_CLIENT_ID = Buffer.from(encryptedClientId, 'base64').toString();

    return {
      DISCORD_TOKEN,
      GUILD_ID,
      BOT_CLIENT_ID,
      CURRENCY_NAME,
      CURRENCY_NAME_PLURAL,
    };
  }

  static DISCORD_TOKEN: string = Config.populateConfig().DISCORD_TOKEN;

  static GUILD_ID: string | undefined = Config.populateConfig().GUILD_ID;

  static BOT_CLIENT_ID: string = Config.populateConfig().BOT_CLIENT_ID;

  static CURRENCY_NAME: string | undefined = Config.populateConfig().CURRENCY_NAME;

  static CURRENCY_NAME_PLURAL: string | undefined = Config.populateConfig().CURRENCY_NAME_PLURAL;
}

namespace Config {
  export const GATEWAY_INTENTS: GatewayIntentsString[] = GatewayIntents.intents;

  export const STREAK_REWARD_NAME: string = Income.jobs.daily.streakRewardName;

  export const STREAK_REWARD_QUANTITY: number = Income.jobs.daily.streakRewardQuantity;

  export const MESSAGE_REWARD_COOLDOWN: number = Income.activity.message.cooldown;

  export const MESSAGE_REWARD_BASE: number = Income.activity.message.baseIncome;

  export const MESSAGE_REWARD_NITRO: number = Income.activity.message.nitroIncome;
}

export default Config;
