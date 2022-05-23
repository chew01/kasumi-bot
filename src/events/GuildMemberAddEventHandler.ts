import type { GuildMember } from 'discord.js';
import BotEventHandler from '../types/BotEventHandler';
import type ExtendedClient from '../ExtendedClient';
import MemberCache from '../cache/MemberCache';
import Member from '../storage/models/Member';
import Level from '../modules/Level';

class GuildMemberAddEventHandler extends BotEventHandler {
  name = 'guildMemberAdd';

  once = false;

  async execute(_client: ExtendedClient, member: GuildMember) {
    MemberCache.initialiseIfNotExists(member.id);
    const level = Member.getExperience(member.id);
    return Level.check(level, member);
  }
}

export default new GuildMemberAddEventHandler();
