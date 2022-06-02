import { ApplicationCommandOptionType, ApplicationCommandSubCommandData, ChatInputCommandInteraction } from 'discord.js';
import Shop from '../../../../storage/models/Shop';
import CurrencyUtils from '../../../../utils/CurrencyUtils';
import Config from '../../../../Config';
import Item from '../../../../storage/models/Item';

export const shopAddRoleSC: ApplicationCommandSubCommandData = {
  name: 'add_role_listing',
  description: 'Add a role listing to the shop',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'role',
      description: 'The role to be added',
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
    {
      name: 'price',
      description: 'The price of the role',
      type: ApplicationCommandOptionType.Integer,
      min_value: 0,
      required: true,
    },
  ],
};

export async function shopAddRole(interaction: ChatInputCommandInteraction) {
  const role = interaction.options.getRole('role');
  if (!role) return interaction.reply({ content: 'You did not choose a valid role. Try again!' });
  const price = interaction.options.getInteger('price');
  if (price === null || price < 0) return interaction.reply({ content: 'You did not choose a valid price. Try again!' });

  if (!interaction.inCachedGuild() || !interaction.guild.members.me) {
    return interaction.reply({ content: Config.ERROR_MSG });
  }
  if (interaction.guild.members.me.roles.highest.comparePositionTo(role.id) <= 0) return interaction.reply({ content: 'That role is above the bot!' });
  if (role === interaction.guild.roles.premiumSubscriberRole) return interaction.reply({ content: 'You can\'t give the Nitro Booster role!' });

  if (Shop.hasRole(role.id)) return interaction.reply({ content: 'The role you chose is already in the shop.' });
  if (!Item.getByRoleId(role.id)) return interaction.reply({ content: 'That role has not been added to the database.' });

  Shop.addRole(role.name, price);

  return interaction.reply({ content: `Successfully listed **${role.name}** for ${CurrencyUtils.format(price)}.` });
}
