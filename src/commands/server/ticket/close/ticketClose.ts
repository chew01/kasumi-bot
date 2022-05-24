import {
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  ChannelType,
  ChatInputCommandInteraction,
} from 'discord.js';
import Config from '../../../../Config';
import Variables from '../../../../storage/models/Variables';

export const ticketCloseSC: ApplicationCommandSubCommandData = {
  name: 'close',
  description: 'Close a ticket',
  type: ApplicationCommandOptionType.Subcommand,
};

export async function ticketClose(interaction: ChatInputCommandInteraction) {
  if (!interaction.inCachedGuild() || !interaction.channel) {
    return interaction.reply({ content: Config.ERROR_MSG });
  }
  const channelName = interaction.channel.name;
  const channelParent = interaction.channel.parent;

  let category = Variables.getTicketCategory();
  if (!category) {
    const createdCategory = await interaction.guild.channels.create('tickets', { type: ChannelType.GuildCategory });
    Variables.registerTicketCategory(createdCategory.id);
    category = createdCategory.id;
  }
  if (!category) return interaction.reply({ content: Config.ERROR_MSG, ephemeral: true });

  if (!channelName.startsWith('ticket-') || channelParent?.id !== category) return interaction.reply({ content: 'This is not a ticket channel!' });

  return interaction.channel.delete();
}
