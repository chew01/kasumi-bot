import { ApplicationCommandOptionType, ApplicationCommandSubCommandData, ChatInputCommandInteraction } from 'discord.js';
import Box from '../../../../storage/models/Box';
import Lootbox from '../../../../modules/Lootbox';

export const managerRemoveLootboxRewardSC: ApplicationCommandSubCommandData = {
  name: 'remove_lootbox_reward',
  description: 'Remove a reward from a lootbox',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'box',
      description: 'Name of the box',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'index',
      description: 'Index of the reward item',
      type: ApplicationCommandOptionType.Integer,
      min_value: 1,
      required: true,
    },
  ],
};

export function managerRemoveLootboxReward(interaction: ChatInputCommandInteraction) {
  const box = interaction.options.getString('box');
  if (!box) return interaction.reply({ content: 'You did not choose a valid loot box name. Try again!' });
  const index = interaction.options.getInteger('index');
  if (!index) return interaction.reply({ content: 'You did not choose a valid index. Try again!' });

  const existingBox = Box.getOne(box);
  if (!existingBox) return interaction.reply({ content: 'That loot box does not exist!' });
  const op = Lootbox.removeReward(box, existingBox.rewards, index - 1);
  if (!op) return interaction.reply({ content: `**${box}** does not have any rewards in **Index ${index}**.` });

  return interaction.reply({ content: `Successfully removed **Index ${index}** from **${box}**.` });
}
