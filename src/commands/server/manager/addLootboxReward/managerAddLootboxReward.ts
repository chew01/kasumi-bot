import { ApplicationCommandOptionType, ApplicationCommandSubCommandData, ChatInputCommandInteraction } from 'discord.js';
import Box from '../../../../storage/models/Box';
import Item from '../../../../storage/models/Item';
import Lootbox from '../../../../modules/Lootbox';

export const managerAddLootboxRewardSC: ApplicationCommandSubCommandData = {
  name: 'add_lootbox_reward',
  description: 'Add a reward to a lootbox',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'box',
      description: 'Name of the box',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'item',
      description: 'Name of the reward item',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'quantity',
      description: 'Quantity of item',
      type: ApplicationCommandOptionType.Integer,
      min_value: 1,
      required: true,
    },
    {
      name: 'odds',
      description: 'Odds of getting the item (in %)',
      type: ApplicationCommandOptionType.Integer,
      min_value: 0,
      max_value: 100,
      required: true,
    },
  ],
};

export function managerAddLootboxReward(interaction: ChatInputCommandInteraction) {
  const box = interaction.options.getString('box');
  if (!box) return interaction.reply({ content: 'You did not choose a valid loot box name. Try again!' });
  const item = interaction.options.getString('item');
  if (!item) return interaction.reply({ content: 'You did not choose a valid item name. Try again!' });
  const quantity = interaction.options.getInteger('quantity');
  if (!quantity) return interaction.reply({ content: 'You did not choose a valid quantity. Try again!' });
  const odds = interaction.options.getInteger('odds');
  if (odds === null) return interaction.reply({ content: 'You did not choose a valid odds value. Try again!' });

  const existingBox = Box.getOne(box);
  if (!existingBox) return interaction.reply({ content: 'That loot box does not exist!' });
  const existingItem = Item.getOne(item);
  if (!existingItem) return interaction.reply({ content: 'That reward item does not exist!' });

  Lootbox.addReward(box, existingBox.rewards, item, quantity, odds);

  return interaction.reply({ content: `Successfully added **${quantity} ${item}** to **${box}** (${odds}% chance)` });
}
