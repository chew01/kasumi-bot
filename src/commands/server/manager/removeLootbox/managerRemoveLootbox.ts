import { ApplicationCommandOptionType, ApplicationCommandSubCommandData, ChatInputCommandInteraction } from 'discord.js';
import Box from '../../../../storage/models/Box';

export const managerRemoveLootboxSC: ApplicationCommandSubCommandData = {
  name: 'remove_lootbox',
  description: 'Remove an existing lootbox',
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

export function managerRemoveLootbox(interaction: ChatInputCommandInteraction) {
  const box = interaction.options.getString('box');
  if (!box) return interaction.reply({ content: 'You did not choose a valid box name. Try again!' });

  const existing = Box.getOne(box);
  if (!existing) return interaction.reply({ content: 'No lootbox exists with that name!' });

  Box.delete(box);

  return interaction.reply({ content: `Successfully removed **${box}** along with its key!` });
}
