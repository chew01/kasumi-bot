import type { MessageReaction } from 'discord.js';
import BotEventHandler from '../types/BotEventHandler';
import type ExtendedClient from '../ExtendedClient';
import Logger from '../services/Logger';
import Starboard from '../modules/Starboard';

class MessageReactionRemoveEventHandler extends BotEventHandler {
  name = 'messageReactionRemove';

  once = false;

  async execute(_client: ExtendedClient, reaction: MessageReaction) {
    if (reaction.partial) {
      try {
        await reaction.fetch();
      } catch (err) {
        if (err instanceof Error) {
          return Logger.error(err.stack || err.message);
        }
      }
    }
    await Starboard.checkRemovedReaction(reaction);
    return null;
  }
}

export default new MessageReactionRemoveEventHandler();