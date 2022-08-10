import {
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  ChannelType,
  ChatInputCommandInteraction,
} from 'discord.js';
import Config from '../../../../Config';

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

  let category = Config.getTicketCategory();
  if (!category) {
    const createdCategory = await interaction.guild.channels.create({
      name: 'tickets',
      type: ChannelType.GuildCategory,
    });
    await Config.setTicketCategory(createdCategory.id);
    category = createdCategory.id;
  }
  if (!category) return interaction.reply({ content: Config.ERROR_MSG, ephemeral: true });

  if (!channelName.startsWith('ticket-') || channelParent?.id !== category) return interaction.reply({ content: 'This is not a ticket channel!' });

  return interaction.channel.delete();
}
