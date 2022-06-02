import { ApplicationCommandOptionType, ApplicationCommandSubCommandData, ChatInputCommandInteraction } from 'discord.js';
import Item from '../../../../storage/models/Item';

export const managerRemoveRoleSC: ApplicationCommandSubCommandData = {
  name: 'remove_role',
  description: 'Remove a role from the database',
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

export function managerRemoveRole(interaction: ChatInputCommandInteraction) {
  const role = interaction.options.getRole('role');
  if (!role) return interaction.reply({ content: 'You did not choose a valid role. Try again!' });

  const existing = Item.getByRoleId(role.id);
  if (!existing) return interaction.reply({ content: 'That role does not exist in the database!' });

  Item.removeRole(role.id);

  return interaction.reply({ content: `Successfully removed **${role}** from the database!` });
}
