import type { Message } from 'discord.js';
import { Formatters } from 'discord.js';
import BotEventHandler from '../types/BotEventHandler';
import type ExtendedClient from '../ExtendedClient';
import ActivityChannelCache from '../cache/ActivityChannelCache';
import Member from '../storage/models/Member';
import MemberCache from '../cache/MemberCache';
import Config from '../Config';
import Level from '../modules/Level';
import MathUtils from '../utils/MathUtils';
import BadWordCache from '../cache/BadWordCache';
import AntiRaid from '../modules/AntiRaid';

class InteractionCreateEventHandler extends BotEventHandler {
  name = 'messageCreate';

  once = false;

  async execute(_client: ExtendedClient, message: Message) {
    if (message.author.bot || !message.member) return null;

    if (BadWordCache.check(message.content)) {
      await message.delete();
      return message.channel.send({ content: `${Formatters.userMention(message.author.id)} ${Config.BADWORD_MSG}` });
    }

    if (message.member.joinedTimestamp
        && (Date.now() - message.member.joinedTimestamp) < 48 * 60 * 60 * 1000) {
      const count = AntiRaid.add(message.content);
      if (count >= Config.ANTIRAID_QUOTA && message.channel.isText()) {
        message.channel.setRateLimitPerUser(Config.ANTIRAID_RATELIMIT, 'Anti-Raid');
      }
    }

    MemberCache.initialiseIfNotExists(message.author.id);

    if (ActivityChannelCache.checkChannel(message.channel.id)) {
      const onCooldown = ActivityChannelCache.checkUser(message.author.id);
      if (!onCooldown) {
        let income: number;
        let exp: number;

        if (message.member?.premiumSinceTimestamp) {
          income = MathUtils.randomInRange(
            Config.MESSAGE_REWARD_NITRO_MIN,
            Config.MESSAGE_REWARD_NITRO_MAX,
          );
          exp = MathUtils.randomInRange(
            Config.MESSAGE_EXP_NITRO_MIN,
            Config.MESSAGE_EXP_NITRO_MAX,
          );
        } else {
          income = MathUtils.randomInRange(
            Config.MESSAGE_REWARD_BASE_MIN,
            Config.MESSAGE_REWARD_BASE_MAX,
          );
          exp = MathUtils.randomInRange(
            Config.MESSAGE_EXP_BASE_MIN,
            Config.MESSAGE_EXP_BASE_MAX,
          );
        }

        Member.addMoney(message.author.id, income);
        const level = Member.addExperience(message.author.id, exp);
        await Level.check(level, message.member, message);

        ActivityChannelCache.addUser(message.author.id);
      }
    }
    return null;
  }
}

export default new InteractionCreateEventHandler();
