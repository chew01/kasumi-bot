import type { Message } from 'discord.js';
import BotEventHandler from '../types/BotEventHandler';
import type ExtendedClient from '../ExtendedClient';
import ActivityChannelCache from '../cache/ActivityChannelCache';
import Member from '../storage/models/Member';
import MemberCache from '../cache/MemberCache';
import Config from '../Config';
import Level from '../modules/Level';
import MathUtils from '../utils/MathUtils';

class InteractionCreateEventHandler extends BotEventHandler {
  name = 'messageCreate';

  once = false;

  async execute(_client: ExtendedClient, message: Message) {
    if (message.author.bot || !message.member) return null;
    if (ActivityChannelCache.checkChannel(message.channel.id)) {
      const onCooldown = ActivityChannelCache.checkUser(message.author.id);
      if (!onCooldown) {
        MemberCache.initialiseIfNotExists(message.author.id);

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
