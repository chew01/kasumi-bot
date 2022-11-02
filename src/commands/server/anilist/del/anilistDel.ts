import { ApplicationCommandOptionType, ApplicationCommandSubCommandData, ChatInputCommandInteraction } from 'discord.js';
import { anilist } from '../../../../ExtendedClient';

export const anilistCommandDelSC: ApplicationCommandSubCommandData = {
  name: 'remove',
  description: 'Remove an anime from the tracking list',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'id',
      description: 'The anime ID to be removed',
      type: ApplicationCommandOptionType.Number,
      required: true,
    },
  ],
};

export function anilistDel(interaction: ChatInputCommandInteraction) {
  const id = interaction.options.getNumber('id');
  if (!id) return interaction.reply({ content: 'You did not choose an ID. Try again!' });

  const ids = anilist.getFromDb();
  if (!ids.includes(id)) return interaction.reply({ content: `ID ${id} is not in the tracking list.` });
  anilist.removeFromDb(id);
  return interaction.reply({ content: `Removed ID ${id} from the anime tracking list.` });
}
