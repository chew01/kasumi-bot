import {
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  ChatInputCommandInteraction,
  EmbedBuilder,
  userMention,
} from 'discord.js';
import BadWordCache from '../../../../cache/BadWordCache';

export const badWordListSC: ApplicationCommandSubCommandData = {
  name: 'list',
  description: 'Get a list of badwords',
  type: ApplicationCommandOptionType.Subcommand,
};

export function badWordList(interaction: ChatInputCommandInteraction) {
  const list = BadWordCache.getList();
  let words = '';
  let users = '';
  list.forEach((bw) => {
    words += `${bw.word}\n`;
    users += `${userMention(bw.user_id)}\n`;
  });

  const embed = new EmbedBuilder()
    .setTitle('Bad Words')
    .addFields([{ name: 'Word', value: words || 'None', inline: true },
      { name: 'Added by', value: users || 'None', inline: true }]);

  return interaction.reply({ embeds: [embed] });
}
