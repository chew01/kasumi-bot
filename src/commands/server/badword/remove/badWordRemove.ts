import {
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  ChatInputCommandInteraction,
} from 'discord.js';
import BadWordCache from '../../../../cache/BadWordCache';

export const badWordRemoveSC: ApplicationCommandSubCommandData = {
  name: 'remove',
  description: 'Remove a badword to the list',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'word',
      description: 'The word to be removed',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};

export function badWordRemove(interaction: ChatInputCommandInteraction) {
  const word = interaction.options.getString('word');
  if (!word) return interaction.reply({ content: 'You did not choose a valid word. Try again!' });

  const op = BadWordCache.remove(word);
  if (!op) return interaction.reply({ content: 'That word is not in the badword list!' });
  return interaction.reply({ content: 'That word was removed from the badword list.' });
}
