import {
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  ChatInputCommandInteraction,
} from 'discord.js';
import Shop from '../../../../storage/models/Shop';
import CurrencyUtils from '../../../../utils/CurrencyUtils';
import Member from '../../../../storage/models/Member';
import Config from '../../../../Config';

export const shopBuyItemSC: ApplicationCommandSubCommandData = {
  name: 'buy_item',
  description: 'Buy an item from the shop',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'item',
      description: 'The item to be bought',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'quantity',
      description: 'The quantity to be bought',
      type: ApplicationCommandOptionType.Integer,
      minValue: 0,
      required: true,
    },
  ],
};

export async function shopBuyItem(interaction: ChatInputCommandInteraction) {
  const item = interaction.options.getString('item');
  if (!item) return interaction.reply({ content: 'You did not choose a valid item. Try again!' });

  const qty = interaction.options.getInteger('quantity');
  if (!qty || qty <= 0) return interaction.reply({ content: 'You did not choose a valid quantity. Try again!' });

  if (!Shop.has(item)) return interaction.reply({ content: 'The item you chose is not in the shop.' });

  const buy = Shop.buyItem(interaction.user.id, item, qty);
  const bal = Member.getBalance(interaction.user.id);
  if (!buy) return interaction.reply({ content: `You don't have enough ${Config.CURRENCY_NAME_PLURAL} to buy the role! You have ${CurrencyUtils.formatEmoji(bal)}` });

  return interaction.reply({ content: `You bought ${qty}x ${item}! You now have ${CurrencyUtils.formatEmoji(bal)}` });
}
