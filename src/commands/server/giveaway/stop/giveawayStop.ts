import { ApplicationCommandOptionType, ApplicationCommandSubCommandData, ChatInputCommandInteraction } from 'discord.js';
import GiveawayManager from '../../../../modules/GiveawayManager';
import Config from '../../../../Config';
import Giveaway from '../../../../storage/models/Giveaway';

export const giveawayStopSC: ApplicationCommandSubCommandData = {
  name: 'stop',
  description: 'Stop a giveaway',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'message_id',
      description: 'Message ID of the giveaway',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};

export async function giveawayStop(interaction: ChatInputCommandInteraction) {
  if (!interaction.inCachedGuild()) {
    return interaction.reply({ content: Config.ERROR_MSG, ephemeral: true });
  }

  const mid = interaction.options.getString('message_id');
  if (!mid) return interaction.reply({ content: 'You did not choose a valid message ID.', ephemeral: true });
  if (!GiveawayManager.checkExists(mid)) return interaction.reply({ content: 'That message ID does not belong to an ongoing giveaway!', ephemeral: true });
  const existing = Giveaway.getOne(mid);
  if (existing && (existing.host !== interaction.user.id || !interaction.member.permissions.has('Administrator'))) {
    return interaction.reply({ content: 'You are not the host or admin! You cannot close this giveaway.', ephemeral: true });
  }

  const op = GiveawayManager.stop(mid);
  if (!op) return interaction.reply({ content: 'Error! Could not stop the giveaway.', ephemeral: true });
  return interaction.reply({ content: 'Giveaway stopped.', ephemeral: true });
}
