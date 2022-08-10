import {
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  ChatInputCommandInteraction,
  EmbedBuilder,
  roleMention,
} from 'discord.js';
import Box from '../../../../storage/models/Box';
import Lootbox from '../../../../modules/Lootbox';
import Config from '../../../../Config';
import Item from '../../../../storage/models/Item';

export const managerInspectLootboxSC: ApplicationCommandSubCommandData = {
  name: 'inspect_lootbox',
  description: 'Inspect lootbox contents',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'box',
      description: 'Name of the box',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};

export function managerInspectLootbox(interaction: ChatInputCommandInteraction) {
  const box = interaction.options.getString('box');
  if (!box) return interaction.reply({ content: 'You did not choose a valid loot box name. Try again!' });

  const existingBox = Box.getOne(box);
  if (!existingBox) return interaction.reply({ content: 'That loot box does not exist!' });

  if (!existingBox.rewards) {
    const embed = new EmbedBuilder()
      .setTitle(box)
      .addFields([
        { name: 'Minimum coins', value: `${existingBox.coin_minimum}` },
        { name: 'Maximum coins', value: `${existingBox.coin_maximum}` },
        { name: 'Rewards', value: 'There are no other rewards specified.' },
      ]);

    return interaction.reply({ embeds: [embed] });
  }

  const output = Lootbox.prettifyReward(existingBox.rewards);
  if (!output) return interaction.reply({ content: Config.ERROR_MSG });

  let indexString = '';
  let itemString = '';
  let quantityString = '';
  output.forEach((reward, index) => {
    indexString += `${index + 1}\n`;
    const item = Item.getOne(reward.item);
    if (!item) return;
    if (item.role_id) {
      itemString += `${roleMention(item.role_id)} - ${reward.odds}%\n`;
    } else {
      itemString += `${reward.item} - ${reward.odds}%\n`;
    }
    quantityString += `${reward.quantity}\n`;
  });

  const embed = new EmbedBuilder()
    .setTitle(box)
    .addFields([
      { name: 'Minimum coins', value: `${existingBox.coin_minimum}` },
      { name: 'Maximum coins', value: `${existingBox.coin_maximum}` },
      { name: 'Index', value: indexString || 'None', inline: true },
      { name: 'Item - Odds', value: itemString || 'None', inline: true },
      { name: 'Qty', value: quantityString || 'None', inline: true },
    ]);

  return interaction.reply({ embeds: [embed] });
}
