import {
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  ChatInputCommandInteraction,
} from 'discord.js';
import Shop from '../../../../storage/models/Shop';
import CurrencyUtils from '../../../../utils/CurrencyUtils';
import Inventory from '../../../../storage/models/Inventory';
import Member from '../../../../storage/models/Member';
import Config from '../../../../Config';

export const shopBuyRoleSC: ApplicationCommandSubCommandData = {
  name: 'buy_role',
  description: 'Buy a role from the shop',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'role',
      description: 'The role to be bought',
      type: ApplicationCommandOptionType.Role,
      required: true,
    },
  ],
};

export async function shopBuyRole(interaction: ChatInputCommandInteraction) {
  const role = interaction.options.getRole('role');
  if (!role) return interaction.reply({ content: 'You did not choose a valid role. Try again!' });

  if (!interaction.inCachedGuild() || !interaction.guild.members.me) {
    return interaction.reply({ content: Config.ERROR_MSG });
  }
  if (interaction.guild.members.me.roles.highest.comparePositionTo(role.id) <= 0) return interaction.reply({ content: 'That role is above the bot! Contact a moderator.' });
  if (role === interaction.guild.roles.premiumSubscriberRole) return interaction.reply({ content: 'You can\'t buy the Nitro Booster role!' });

  if (!Shop.has(role.name)) return interaction.reply({ content: 'The role you chose is not in the shop.' });
  if (Inventory.has(interaction.user.id, role.name)) return interaction.reply({ content: 'You already own this role!' });

  const buy = Shop.buyRole(interaction.user.id, role.name);
  const bal = Member.getBalance(interaction.user.id);
  if (!buy) return interaction.reply({ content: `You don't have enough ${Config.CURRENCY_NAME_PLURAL} to buy the role! You have ${CurrencyUtils.formatEmoji(bal)}` });

  await interaction.member.roles.add(role.id);

  return interaction.reply({ content: `You bought the **${role.name}** role! You now have ${CurrencyUtils.formatEmoji(bal)}` });
}
