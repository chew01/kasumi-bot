import {
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  ChatInputCommandInteraction,
  EmbedBuilder,
  Formatters,
} from 'discord.js';
import Config from '../../../../Config';

export const configListSC: ApplicationCommandSubCommandData = {
  name: 'list',
  description: 'Get a list of current configuration options',
  type: ApplicationCommandOptionType.Subcommand,
};

export function configList(interaction: ChatInputCommandInteraction) {
  const ticketCategory = Config.getTicketCategory();
  const ticketModRole = Config.getTicketModRole();

  const embed = new EmbedBuilder()
    .setTitle('⚙ Server Configuration ⚙')
    .addFields([
      { name: 'Ticket Category', value: `${Formatters.channelMention(ticketCategory)} (ID: ${ticketCategory})` || 'None' },
      { name: 'Ticket Mod Role', value: `${Formatters.roleMention(ticketModRole)} (ID: ${ticketModRole})` || 'None' },
    ]);

  return interaction.reply({ embeds: [embed] });
}
