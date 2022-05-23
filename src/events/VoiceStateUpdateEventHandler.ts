import type { VoiceState } from 'discord.js';
import BotEventHandler from '../types/BotEventHandler';
import type ExtendedClient from '../ExtendedClient';
import VoiceParticipationCache from '../cache/VoiceParticipationCache';
import MemberCache from '../cache/MemberCache';

class VoiceStateUpdateEventHandler extends BotEventHandler {
  name = 'voiceStateUpdate';

  once = false;

  async execute(_client: ExtendedClient, _oldState: VoiceState, newState: VoiceState) {
    if (newState.channelId && newState.member) {
      MemberCache.initialiseIfNotExists(newState.id);
      VoiceParticipationCache.join(newState.id, newState.member);
    } else {
      VoiceParticipationCache.leave(newState.id);
    }
  }
}

export default new VoiceStateUpdateEventHandler();
