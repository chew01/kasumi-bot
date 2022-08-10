import {
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  channelMention,
  ChatInputCommandInteraction,
  EmbedBuilder,
  roleMention,
} from 'discord.js';
import Config from '../../../../Config';
import Starboard from '../../../../modules/Starboard';

export const configListSC: ApplicationCommandSubCommandData = {
  name: 'list',
  description: 'Get a list of current configuration options',
  type: ApplicationCommandOptionType.Subcommand,
};

export function configList(interaction: ChatInputCommandInteraction) {
  const ticketCategory = Config.getTicketCategory();
  const ticketModRole = Config.getTicketModRole();
  const { quota, emoji, channel } = Starboard.getSettings();
  const autoroles = Config.getAutoRoles().map((roleId) => roleMention(roleId)).join('\n');

  const embed = new EmbedBuilder()
    .setTitle('⚙ Server Configuration ⚙')
    .addFields([
      {
        name: 'Ticket Category',
        value: ticketCategory ? `${channelMention(ticketCategory)} (ID: ${ticketCategory})` : 'Not set',
      },
      {
        name: 'Ticket Mod Role',
        value: ticketModRole ? `${roleMention(ticketModRole)} (ID: ${ticketModRole})` : 'Not set',
      },
      { name: 'Starboard Quota', value: `${quota}` },
      { name: 'Starboard Emoji', value: emoji ? `${emoji}` : 'Not set' },
      { name: 'Starboard Channel', value: channel ? `${channelMention(channel)}` : 'Not set' },
      { name: 'Auto-Assign Roles', value: autoroles || 'Not set' },
    ]);

  return interaction.reply({ embeds: [embed] });
}
