import { ApplicationCommandOptionType, ApplicationCommandSubCommandData, ChatInputCommandInteraction } from 'discord.js';
import Shop from '../../../../storage/models/Shop';

export const shopDelRoleSC: ApplicationCommandSubCommandData = {
  name: 'del_role_listing',
  description: 'Delete a role listing from the shop',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'role',
      description: 'The role to be delisted',
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
  ],
};

export async function shopDelRole(interaction: ChatInputCommandInteraction) {
  const role = interaction.options.getRole('role');
  if (!role) return interaction.reply({ content: 'You did not choose a valid role. Try again!' });

  if (!Shop.hasRole(role.id)) return interaction.reply({ content: 'The role you chose is not in the shop.' });

  Shop.removeRole(role.name);
  return interaction.reply({ content: `Successfully delisted **${role.name}**.` });
}
