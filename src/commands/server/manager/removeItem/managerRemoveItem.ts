import { ApplicationCommandOptionType, ApplicationCommandSubCommandData, ChatInputCommandInteraction } from 'discord.js';
import Item from '../../../../storage/models/Item';

export const managerRemoveItemSC: ApplicationCommandSubCommandData = {
  name: 'remove_item',
  description: 'Remove an existing item',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'item',
      description: 'Name of the item',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};

export function managerRemoveItem(interaction: ChatInputCommandInteraction) {
  const item = interaction.options.getString('item');
  if (!item) return interaction.reply({ content: 'You did not choose a valid item name. Try again!' });

  const existing = Item.getOne(item);
  if (!existing) return interaction.reply({ content: 'No item exists with that name!' });

  Item.delete(item);

  return interaction.reply({ content: `Successfully removed the **${item}** item!` });
}
