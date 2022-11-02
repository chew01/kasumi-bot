import {
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  channelMention,
  ChannelType,
  ChatInputCommandInteraction,
} from 'discord.js';
import Config from '../../../../Config';

export const configAnilistChannelSC: ApplicationCommandSubCommandData = {
  name: 'set_anilist_channel',
  description: 'Set the channel for anime notifications',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'channel',
      description: 'The anime notification channel',
      type: ApplicationCommandOptionType.Channel,
    },
  ],
};

export async function configAnilistChannel(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild || !interaction.guild.members.me) {
    return interaction.reply({ content: Config.ERROR_MSG });
  }
  const channel = interaction.options.getChannel('channel');
  if (!channel) {
    await Config.setAnilistChannel('');
    return interaction.reply({ content: 'Anime notification channel has been cleared from the config!' });
  }

  if (channel.type !== ChannelType.GuildText) return interaction.reply({ content: 'You did not choose a valid channel. Try again!' });
  const guildChannel = interaction.guild.channels.cache.get(channel.id);
  if (!guildChannel || !guildChannel.permissionsFor(interaction.guild.members.me).has('SendMessages')) {
    return interaction.reply({ content: 'I don\'t have permission to send messages in that channel!' });
  }

  await Config.setAnilistChannel(channel.id);

  return interaction.reply({ content: `Successfully set anime notification channel to ${channelMention(channel.id)}` });
}
