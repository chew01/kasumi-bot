import { ApplicationCommandOptionType, ApplicationCommandSubCommandData, ChatInputCommandInteraction } from 'discord.js';
import Config from '../../../../Config';

export const configTicketModRoleSC: ApplicationCommandSubCommandData = {
  name: 'set_ticketmod_role',
  description: 'Set a new ticket mod role',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'role',
      description: 'The new role',
      type: ApplicationCommandOptionType.Role,
    },
  ],
};

export async function configTicketModRole(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild || !interaction.guild.members.me) {
    return interaction.reply({ content: Config.ERROR_MSG });
  }
  const role = interaction.options.getRole('role');
  if (!role) {
    await Config.setTicketModRole('');
    return interaction.reply({ content: 'Ticket mod role has been cleared from the config!' });
  }

  if (!interaction.guild.members.me.permissions.has('ManageRoles')) return interaction.reply({ content: 'I don\'t have permission to manage roles!' });
  await Config.setTicketModRole(role.id);

  return interaction.reply({ content: `Successfully set ticket mod role to **${role.name}**` });
}
