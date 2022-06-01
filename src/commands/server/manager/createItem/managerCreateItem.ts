import { ApplicationCommandOptionType, ApplicationCommandSubCommandData, ChatInputCommandInteraction } from 'discord.js';
import Item from '../../../../storage/models/Item';

export const managerCreateItemSC: ApplicationCommandSubCommandData = {
  name: 'create_item',
  description: 'Create a new item',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'name',
      description: 'Name of the item',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};

export function managerCreateItem(interaction: ChatInputCommandInteraction) {
  const name = interaction.options.getString('name');
  if (!name) return interaction.reply({ content: 'You did not choose a valid name. Try again!' });

  const existing = Item.getOne(name);
  if (existing) return interaction.reply({ content: 'An item already exists with the same name!' });

  Item.create(name);

  return interaction.reply({ content: `Successfully created the **${name}** item!` });
}
