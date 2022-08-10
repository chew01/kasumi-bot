import type { VoiceState } from 'discord.js';
import BotEventHandler from '../types/BotEventHandler';
import type ExtendedClient from '../ExtendedClient';
import VoiceParticipationCache from '../cache/VoiceParticipationCache';
import MemberCache from '../cache/MemberCache';
import Config from '../Config';

class VoiceStateUpdateEventHandler extends BotEventHandler {
  name = 'voiceStateUpdate';

  once = false;

  async execute(_client: ExtendedClient, _oldState: VoiceState, newState: VoiceState) {
    if (newState.guild.id !== Config.GUILD_ID) return null;

    if (newState.channelId && newState.member
        && newState.channelId !== newState.guild.afkChannelId) {
      MemberCache.initialiseIfNotExists(newState.id);
      VoiceParticipationCache.join(newState.id, newState.member);
    } else {
      VoiceParticipationCache.leave(newState.id);
    }

    return null;
  }
}

export default new VoiceStateUpdateEventHandler();
