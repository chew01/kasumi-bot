import { ApplicationCommandOptionType, ApplicationCommandSubCommandData, ChatInputCommandInteraction } from 'discord.js';
import Config from '../../../../Config';

export const configDelAutoRoleSC: ApplicationCommandSubCommandData = {
  name: 'del_autorole',
  description: 'Remove a role from being auto-assigned to new users',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'role',
      description: 'Role to be removed',
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
  ],

};

export async function configDelAutoRole(interaction: ChatInputCommandInteraction) {
  const role = interaction.options.getRole('role');
  if (!role) return interaction.reply({ content: 'You did not choose a valid role. Try again!' });

  const autoroles = Config.getAutoRoles();
  if (!autoroles.includes(role.id)) return interaction.reply({ content: 'That role is not in the auto-assign list!' });

  const index = autoroles.indexOf(role.id);
  autoroles.splice(index, 1);
  await Config.setAutoRoles(autoroles);

  return interaction.reply({ content: `Successfully removed the ${role.name} role from the auto-assign list.` });
}
