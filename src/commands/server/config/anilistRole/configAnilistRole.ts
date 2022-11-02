import { ApplicationCommandOptionType, ApplicationCommandSubCommandData, ChatInputCommandInteraction } from 'discord.js';
import Config from '../../../../Config';

export const configAnilistRoleSC: ApplicationCommandSubCommandData = {
  name: 'set_anilist_role',
  description: 'Set a new anime notification role',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'role',
      description: 'The new role',
      type: ApplicationCommandOptionType.Role,
    },
  ],
};

export async function configAnilistRole(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild || !interaction.guild.members.me) {
    return interaction.reply({ content: Config.ERROR_MSG });
  }
  const role = interaction.options.getRole('role');
  if (!role) {
    await Config.setAnilistRole('');
    return interaction.reply({ content: 'Anime announcement role has been cleared from the config!' });
  }

  if (!interaction.guild.members.me.permissions.has('ManageRoles')) return interaction.reply({ content: 'I don\'t have permission to manage roles!' });
  await Config.setTicketModRole(role.id);

  return interaction.reply({ content: `Successfully set anime notification role to **${role.name}**` });
}
