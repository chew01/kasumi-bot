import {
  ChannelType,
  CommandInteraction,
  EmbedBuilder,
  Formatters,
  SlashCommandBuilder,
} from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import ActivityChannelCache from '../../../cache/ActivityChannelCache';

class ActivityChannelCommand extends SlashCommand {
  async execute(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return interaction.reply({ content: 'Oops, we ran into an error. Try again!' });
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'list') {
      const channels = ActivityChannelCache.getChannels();
      let tracked = '';
      channels.forEach((channel) => {
        tracked += `${Formatters.channelMention(channel)}\n`;
      });

      const embed = new EmbedBuilder()
        .setTitle('Activity Channels')
        .setDescription('Here are the channels being tracked for activity:')
        .addFields([{ name: 'Channels', value: tracked || 'None' }]);

      return interaction.reply({ embeds: [embed] });
    }

    const channel = interaction.options.getChannel('channel');
    if (!channel || channel.type !== ChannelType.GuildText) return interaction.reply({ content: 'You did not choose a valid channel. Try again!' });

    if (subcommand === 'add') {
      const check = ActivityChannelCache.checkChannel(channel.id);
      if (check) return interaction.reply({ content: 'That channel is already being tracked for activity!' });
      const add = ActivityChannelCache.addChannel(channel.id);
      if (add) return interaction.reply({ content: `The channel ${Formatters.channelMention(channel.id)} was added to the activity tracking list.` });
      return interaction.reply({ content: 'Oops, we ran into an error. Try again!' });
    }

    if (subcommand === 'remove') {
      const check = ActivityChannelCache.checkChannel(channel.id);
      if (!check) return interaction.reply({ content: 'That channel is not on the tracking list!' });
      const remove = ActivityChannelCache.removeChannel(channel.id);
      if (remove) return interaction.reply({ content: `The channel ${Formatters.channelMention(channel.id)} was removed from the activity tracking list.` });
      return interaction.reply({ content: 'Oops, we ran into an error. Try again!' });
    }

    return null;
  }
}

export const builder = new SlashCommandBuilder()
  .setName('activity_channel')
  .setDescription('Manages channels to be tracked for activity')
  .addSubcommand((sub) => sub
    .setName('list')
    .setDescription('Fetches a list of channels that are being tracked for activity'))
  .addSubcommand((sub) => sub
    .setName('add')
    .setDescription('Add a channel to track for activity')
    .addChannelOption((option) => option
      .setName('channel')
      .setDescription('The channel to be tracked')
      .setRequired(true)))
  .addSubcommand((sub) => sub
    .setName('remove')
    .setDescription('Remove a channel from activity tracking')
    .addChannelOption((option) => option
      .setName('channel')
      .setDescription('The channel to be removed')
      .setRequired(true)));

export default new ActivityChannelCommand();
