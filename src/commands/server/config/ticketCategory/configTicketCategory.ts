import {
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  ChannelType,
  ChatInputCommandInteraction,
  Formatters,
} from 'discord.js';
import Config from '../../../../Config';

export const configTicketCategorySC: ApplicationCommandSubCommandData = {
  name: 'set_ticket_category',
  description: 'Set a new ticket category',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'category',
      description: 'The new category',
      type: ApplicationCommandOptionType.Channel,
    },
  ],
};

export async function configTicketCategory(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild || !interaction.guild.members.me) {
    return interaction.reply({ content: Config.ERROR_MSG });
  }
  const category = interaction.options.getChannel('category');
  if (!category) {
    await Config.setTicketCategory('');
    return interaction.reply({ content: 'Ticket category has been cleared from the config!' });
  }

  if (category.type !== ChannelType.GuildCategory) return interaction.reply({ content: 'You did not choose a valid category. Try again!' });
  if (!interaction.guild.members.me.permissions.has('ManageChannels')) return interaction.reply({ content: 'I don\'t have permission to manage channels!' });
  const guildCategory = interaction.guild.channels.cache.get(category.id);
  if (!guildCategory || !guildCategory.permissionsFor(interaction.guild.members.me).has('ViewChannel')) {
    return interaction.reply({ content: 'I don\'t have permission to view that category!' });
  }

  await Config.setTicketCategory(category.id);

  return interaction.reply({ content: `Successfully set ticket category to ${Formatters.channelMention(category.id)}` });
}
