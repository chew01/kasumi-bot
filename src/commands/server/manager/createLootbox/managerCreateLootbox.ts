import { ApplicationCommandOptionType, ApplicationCommandSubCommandData, ChatInputCommandInteraction } from 'discord.js';
import Item from '../../../../storage/models/Item';
import Box from '../../../../storage/models/Box';

export const managerCreateLootboxSC: ApplicationCommandSubCommandData = {
  name: 'create_lootbox',
  description: 'Create a new lootbox',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'box',
      description: 'Name of the box',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'key',
      description: 'Name of the key',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};

export function managerCreateLootbox(interaction: ChatInputCommandInteraction) {
  const box = interaction.options.getString('box');
  const key = interaction.options.getString('key');
  if (!box || !key) return interaction.reply({ content: 'You did not choose a valid name. Try again!' });

  const existingBox = Item.getOne(box);
  if (existingBox) return interaction.reply({ content: 'An item already exists with the same box name!' });
  const existingKey = Item.getOne(key);
  if (existingKey) return interaction.reply({ content: 'An item already exists with the same key name!' });

  Box.create(box, key);

  return interaction.reply({ content: `Successfully created the **${box}** with **${key}** set as key!` });
}
