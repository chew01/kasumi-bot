import { ApplicationCommandOptionType, ApplicationCommandSubCommandData, ChatInputCommandInteraction } from 'discord.js';
import Item from '../../../../storage/models/Item';
import Config from '../../../../Config';

export const managerCreateRoleSC: ApplicationCommandSubCommandData = {
  name: 'create_role',
  description: 'Add a new role to the database',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'role',
      description: 'Role to be added',
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
  ],
};

export function managerCreateRole(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild || !interaction.guild.members.me) {
    return interaction.reply({ content: Config.ERROR_MSG });
  }
  const role = interaction.options.getRole('role');
  if (!role) return interaction.reply({ content: 'You did not choose a valid role. Try again!' });

  const existing = Item.getByRoleId(role.id);
  if (existing) return interaction.reply({ content: 'A role already exists with the same name!' });

  if (interaction.guild.members.me.roles.highest.comparePositionTo(role.id) <= 0) return interaction.reply({ content: 'That role is above the bot!' });
  if (role === interaction.guild.roles.premiumSubscriberRole) return interaction.reply({ content: 'You can\'t add the Nitro Booster role!' });

  Item.createRole(role.name, role.id);

  return interaction.reply({ content: `Successfully added **${role}** to the database!` });
}
