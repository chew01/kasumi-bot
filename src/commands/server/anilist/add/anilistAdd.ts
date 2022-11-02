import { ApplicationCommandOptionType, ApplicationCommandSubCommandData, ChatInputCommandInteraction } from 'discord.js';
import { anilist } from '../../../../ExtendedClient';

export const anilistCommandAddSC: ApplicationCommandSubCommandData = {
  name: 'add',
  description: 'Add an anime to be tracked',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'id',
      description: 'The anime ID to be added',
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ],
};

export function anilistAdd(interaction: ChatInputCommandInteraction) {
  const id = interaction.options.getNumber('id');
  if (!id) return interaction.reply({ content: 'You did not choose an ID. Try again!' });

  const ids = anilist.getFromDb();
  if (ids.includes(id)) return interaction.reply({ content: `ID ${id} is already in the tracking list.` });
  anilist.addToDB(id);
  return interaction.reply({ content: `Added ID ${id} to anime tracking list.` });
}
