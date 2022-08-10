import {
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  channelMention,
  ChannelType,
  ChatInputCommandInteraction,
} from 'discord.js';
import ActivityChannelCache from '../../../../cache/ActivityChannelCache';

export const activityCommandAddSC: ApplicationCommandSubCommandData = {
  name: 'add',
  description: 'Add a channel to track for activity',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'channel',
      description: 'The channel to be added',
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
  ],
};

export function activityChannelAdd(interaction: ChatInputCommandInteraction) {
  const channel = interaction.options.getChannel('channel');
  if (!channel || channel.type !== ChannelType.GuildText) return interaction.reply({ content: 'You did not choose a valid channel. Try again!' });

  if (ActivityChannelCache.checkChannel(channel.id)) return interaction.reply({ content: 'That channel is already being tracked for activity!' });
  ActivityChannelCache.addChannel(channel.id);
  return interaction.reply({ content: `The channel ${channelMention(channel.id)} was added to the activity tracking list.` });
}
