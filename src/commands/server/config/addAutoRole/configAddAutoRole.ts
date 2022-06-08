import { ApplicationCommandOptionType, ApplicationCommandSubCommandData, ChatInputCommandInteraction } from 'discord.js';
import Config from '../../../../Config';

export const configAddAutoRoleSC: ApplicationCommandSubCommandData = {
  name: 'add_autorole',
  description: 'Add a role to be auto-assigned to new users',
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

export async function configAddAutoRole(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild || !interaction.guild.members.me) {
    return interaction.reply({ content: Config.ERROR_MSG });
  }
  const role = interaction.options.getRole('role');
  if (!role) return interaction.reply({ content: 'You did not choose a valid role. Try again!' });
  if (interaction.guild.members.me.roles.highest.comparePositionTo(role.id) <= 0) return interaction.reply({ content: 'That role is above the bot!' });
  if (role === interaction.guild.roles.premiumSubscriberRole) return interaction.reply({ content: 'You can\'t add the Nitro Booster role!' });

  const autoroles = Config.getAutoRoles();
  if (autoroles.includes(role.id)) return interaction.reply({ content: 'That role is already in the auto-assign list!' });

  autoroles.push(role.id);
  await Config.setAutoRoles(autoroles);

  return interaction.reply({ content: `Successfully added the ${role.name} role to the auto-assign list.` });
}
