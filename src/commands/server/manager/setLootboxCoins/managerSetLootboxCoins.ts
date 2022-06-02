import { ApplicationCommandOptionType, ApplicationCommandSubCommandData, ChatInputCommandInteraction } from 'discord.js';
import Box from '../../../../storage/models/Box';
import Config from '../../../../Config';
import CurrencyUtils from '../../../../utils/CurrencyUtils';

export const managerSetLootboxCoinsSC: ApplicationCommandSubCommandData = {
  name: 'set_lootbox_coins',
  description: `Set the minimum and maximum ${Config.CURRENCY_NAME} reward range for a lootbox`,
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'box',
      description: 'Name of the box',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'min',
      description: `Minimum ${Config.CURRENCY_NAME} reward`,
      type: ApplicationCommandOptionType.Integer,
      min_value: 0,
      required: true,
    },
    {
      name: 'max',
      description: `Maximum ${Config.CURRENCY_NAME} reward`,
      type: ApplicationCommandOptionType.Integer,
      min_value: 0,
      required: true,
    },
  ],
};

export function managerSetLootboxCoins(interaction: ChatInputCommandInteraction) {
  const box = interaction.options.getString('box');
  if (!box) return interaction.reply({ content: 'You did not choose a valid loot box name. Try again!' });
  const min = interaction.options.getInteger('min');
  if (min === null) return interaction.reply({ content: 'You did not choose a valid minimum value. Try again!' });
  const max = interaction.options.getInteger('max');
  if (max === null) return interaction.reply({ content: 'You did not choose a valid maximum value. Try again!' });

  const existingBox = Box.getOne(box);
  if (!existingBox) return interaction.reply({ content: 'That loot box does not exist!' });

  Box.setCoin(box, min, max);

  return interaction.reply({ content: `Successfully set ${Config.CURRENCY_NAME} rewards.\nMinimum: **${CurrencyUtils.format(min)}**.\nMinimum: **${CurrencyUtils.format(max)}**` });
}
