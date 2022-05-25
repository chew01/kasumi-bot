import {
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  ChatInputCommandInteraction,
} from 'discord.js';
import BadWordCache from '../../../../cache/BadWordCache';
import Config from '../../../../Config';

export const badWordAddSC: ApplicationCommandSubCommandData = {
  name: 'add',
  description: 'Add a badword to the list',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'word',
      description: 'The word to be added',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};

export function badWordAdd(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild || !interaction.guild.members.me) {
    return interaction.reply({ content: Config.ERROR_MSG });
  }
  if (!interaction.guild.members.me.permissions.has('ManageMessages')) return interaction.reply({ content: 'I don\'t have permission to delete messages!' });

  const word = interaction.options.getString('word');
  if (!word) return interaction.reply({ content: 'You did not choose a valid word. Try again!' });

  const op = BadWordCache.add(word, interaction.user.id);
  if (!op) return interaction.reply({ content: 'That word is already in the badword list!' });
  return interaction.reply({ content: 'That word was added to the badword list.' });
}
