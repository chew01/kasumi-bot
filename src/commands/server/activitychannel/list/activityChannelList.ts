import {
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  channelMention,
  ChatInputCommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import ActivityChannelCache from '../../../../cache/ActivityChannelCache';

export const activityCommandListSC: ApplicationCommandSubCommandData = {
  name: 'list',
  description: 'Get a list of channels that are being tracked for activity',
  type: ApplicationCommandOptionType.Subcommand,
};

export function activityChannelList(interaction: ChatInputCommandInteraction) {
  const channels = ActivityChannelCache.getChannelIds();
  let tracked = '';
  channels.forEach((channel) => {
    tracked += `${channelMention(channel)}\n`;
  });

  const embed = new EmbedBuilder()
    .setTitle('Activity Channels')
    .setDescription('Here are the channels being tracked for activity:')
    .addFields([{ name: 'Channels', value: tracked || 'None' }]);

  return interaction.reply({ embeds: [embed] });
}
