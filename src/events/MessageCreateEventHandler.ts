import type { Message } from 'discord.js';
import BotEventHandler from '../types/BotEventHandler';
import type ExtendedClient from '../ExtendedClient';
import ActivityChannelCache from '../cache/ActivityChannelCache';
import Member from '../storage/models/Member';
import MemberCache from '../cache/MemberCache';
import Config from '../Config';

class InteractionCreateEventHandler extends BotEventHandler {
  name = 'messageCreate';

  once = false;

  async execute(_client: ExtendedClient, message: Message) {
    if (message.author.bot) return null;
    if (ActivityChannelCache.checkChannel(message.channel.id)) {
      const onCooldown = ActivityChannelCache.checkUser(message.author.id);
      if (!onCooldown) {
        MemberCache.initialiseIfNotExists(message.author.id);

        const payout = message.member?.premiumSinceTimestamp
          ? Config.MESSAGE_REWARD_NITRO : Config.MESSAGE_REWARD_BASE;
        Member.addMoney(message.author.id, payout);
        ActivityChannelCache.addUser(message.author.id);
      }
    }
    return null;
  }
}

export default new InteractionCreateEventHandler();
