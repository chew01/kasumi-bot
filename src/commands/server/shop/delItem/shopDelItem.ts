import {
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  ChatInputCommandInteraction,
} from 'discord.js';
import Shop from '../../../../storage/models/Shop';

export const shopDelItemSC: ApplicationCommandSubCommandData = {
  name: 'del_item_listing',
  description: 'Delete an item listing from the shop',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'item',
      description: 'The item to be delisted',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};

export async function shopDelItem(interaction: ChatInputCommandInteraction) {
  const item = interaction.options.getString('item');
  if (!item) return interaction.reply({ content: 'You did not choose a valid item. Try again!' });

  if (!Shop.has(item)) return interaction.reply({ content: 'The item you chose is not in the shop.' });

  Shop.removeItem(item);
  return interaction.reply({ content: `Successfully delisted ${item}.` });
}
