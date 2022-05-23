import {
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  ChatInputCommandInteraction,
} from 'discord.js';
import Shop from '../../../../storage/models/Shop';
import CurrencyUtils from '../../../../utils/CurrencyUtils';
import Item from '../../../../storage/models/Item';

export const shopAddItemSC: ApplicationCommandSubCommandData = {
  name: 'add_item_listing',
  description: 'Add an item listing to the shop',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'item',
      description: 'The item to be added',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'price',
      description: 'The price of the item',
      type: ApplicationCommandOptionType.Integer,
      min_value: 0,
      required: true,
    },
  ],
};

export async function shopAddItem(interaction: ChatInputCommandInteraction) {
  const item = interaction.options.getString('item');
  if (!item) return interaction.reply({ content: 'You did not choose a valid item. Try again!' });
  const price = interaction.options.getInteger('price');
  if (price === null || price < 0) return interaction.reply({ content: 'You did not choose a valid price. Try again!' });

  if (!Item.getOne(item)) return interaction.reply({ content: 'That item does not exist!' });
  if (Shop.has(item)) return interaction.reply({ content: 'The item you chose is already in the shop.' });

  Shop.addItem(item, price);
  return interaction.reply({ content: `Successfully listed ${item} for ${CurrencyUtils.format(price)}.` });
}
