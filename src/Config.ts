import 'dotenv/config';
import type { ActivityType, GatewayIntentsString } from 'discord.js';

const Income = require('../config/income.json');
const Games = require('../config/games.json');
const Settings = require('../config/settings.json');
const Roles = require('../config/roles.json');

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
  export const GATEWAY_INTENTS: GatewayIntentsString[] = Settings.intents;

  export const BASE_DAILY_INCOME: number = Income.jobs.daily.baseDailyIncome;
  export const STREAK_REWARD_NAME: string = Income.jobs.daily.streakRewardName;
  export const STREAK_REWARD_QUANTITY: number = Income.jobs.daily.streakRewardQuantity;

  export const FISHING_COOLDOWN: number = Income.jobs.fish.cooldown;
  export const FISHING_MIN_REWARD: number = Income.jobs.fish.minimum;
  export const FISHING_MAX_REWARD: number = Income.jobs.fish.maximum;

  export const MINING_COOLDOWN: number = Income.jobs.mine.cooldown;
  export const MINING_MIN_REWARD: number = Income.jobs.mine.minimum;
  export const MINING_MAX_REWARD: number = Income.jobs.mine.maximum;

  export const MESSAGE_REWARD_COOLDOWN: number = Income.activity.message.incomeCooldown;
  export const MESSAGE_REWARD_BASE_MIN: number = Income.activity.message.baseIncomeMinimum;
  export const MESSAGE_REWARD_BASE_MAX: number = Income.activity.message.baseIncomeMaximum;
  export const MESSAGE_REWARD_NITRO_MIN: number = Income.activity.message.nitroIncomeMinimum;
  export const MESSAGE_REWARD_NITRO_MAX: number = Income.activity.message.nitroIncomeMaximum;
  export const MESSAGE_EXP_BASE_MIN: number = Income.activity.message.baseExperienceMinimum;
  export const MESSAGE_EXP_BASE_MAX: number = Income.activity.message.baseExperienceMaximum;
  export const MESSAGE_EXP_NITRO_MIN: number = Income.activity.message.nitroExperienceMinimum;
  export const MESSAGE_EXP_NITRO_MAX: number = Income.activity.message.nitroExperienceMaximum;

  export const VOICE_REWARD_COOLDOWN: number = Income.activity.voice.experienceCooldown;
  export const VOICE_EXP_BASE_MIN: number = Income.activity.voice.baseExperienceMinimum;
  export const VOICE_EXP_BASE_MAX: number = Income.activity.voice.baseExperienceMaximum;
  export const VOICE_EXP_NITRO_MIN: number = Income.activity.voice.nitroExperienceMinimum;
  export const VOICE_EXP_NITRO_MAX: number = Income.activity.voice.nitroExperienceMaximum;

  export const BLACKJACK_MIN_BET: number = Games.gambling.blackjack.minimumBet;
  export const BLACKJACK_MAX_BET: number = Games.gambling.blackjack.maximumBet;
  export const BLACKJACK_MULTIPLIER: number = Games.gambling.blackjack.multiplier;
  export const BLACKJACK_INACTIVITY: number = Games.gambling.blackjack.inactivity;

  export const ROULETTE_MIN_BET: number = Games.gambling.roulette.minimumBet;
  export const ROULETTE_MAX_BET: number = Games.gambling.roulette.maximumBet;
  export const ROULETTE_MULTIPLIER: number = Games.gambling.roulette.multiplier;
  export const ROULETTE_JACKPOT: number = Games.gambling.roulette.jackpotMultiplier;

  export const COINFLIP_MIN_BET: number = Games.gambling.coinflip.minimumBet;
  export const COINFLIP_MAX_BET: number = Games.gambling.coinflip.maximumBet;
  export const COINFLIP_MULTIPLIER: number = Games.gambling.coinflip.multiplier;

  export const SLOTS_MIN_BET: number = Games.gambling.slots.minimumBet;
  export const SLOTS_MAX_BET: number = Games.gambling.slots.maximumBet;
  export const SLOTS_ICONS: string[] = Games.gambling.slots.icons;
  export const SLOTS_WEIGHTAGE: number[] = Games.gambling.slots.weightage;
  export const SLOTS_MULTIPLIER: number[] = Games.gambling.slots.multiplier;

  export const ERROR_MSG: string = Settings.messages.error;
  export const BADWORD_MSG: string = Settings.messages.badword;

  export const TRADE_EXPIRY: number = Settings.trade.expiry;
  export const ACTIVITY_DESCRIPTION: string = Settings.activity.description;
  export const ACTIVITY_TYPE: ActivityType.Listening | ActivityType.Competing |
  ActivityType.Playing | ActivityType.Watching | ActivityType.Streaming = Settings.activity.type;

  export const ANTIRAID_LOGEXPIRY: number = Settings.antiraid.logExpiry;
  export const ANTIRAID_QUOTA: number = Settings.antiraid.quota;
  export const ANTIRAID_RATELIMIT: number = Settings.antiraid.rateLimit;

  export const LEVEL_ROLES: string[] = Roles.levels;

}

export default Config;
