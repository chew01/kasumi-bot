import {
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  ChannelType,
  ChatInputCommandInteraction,
  Formatters,
} from 'discord.js';
import ActivityChannelCache from '../../../../cache/ActivityChannelCache';

export const activityCommandDelSC: ApplicationCommandSubCommandData = {
  name: 'remove',
  description: 'Remove a channel from activity tracking',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'channel',
      description: 'The channel to be removed',
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
  ],
};

export function activityChannelDel(interaction: ChatInputCommandInteraction) {
  const channel = interaction.options.getChannel('channel');
  if (!channel || channel.type !== ChannelType.GuildText) return interaction.reply({ content: 'You did not choose a valid channel. Try again!' });

  if (!ActivityChannelCache.checkChannel(channel.id)) return interaction.reply({ content: 'That channel is not on the tracking list!' });
  ActivityChannelCache.removeChannel(channel.id);
  return interaction.reply({ content: `The channel ${Formatters.channelMention(channel.id)} was removed from the activity tracking list.` });
}
