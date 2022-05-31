import {
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  ChannelType,
  ChatInputCommandInteraction,
  Formatters,
} from 'discord.js';
import emojiRegex from 'emoji-regex';
import Config from '../../../../Config';
import Starboard from '../../../../modules/Starboard';

export const configStarboardSC: ApplicationCommandSubCommandData = {
  name: 'set_starboard',
  description: 'Change starboard settings',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'quota',
      description: 'The minimum number of star reacts for a message to be added to starboard',
      type: ApplicationCommandOptionType.Integer,
      min_value: 1,
      required: true,
    },
    {
      name: 'emoji',
      description: 'The emoji to be counted in the starboard',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'channel',
      description: 'The starboard channel',
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
  ],
};

export async function configStarboard(interaction: ChatInputCommandInteraction) {
  if (!interaction.guild || !interaction.guild.members.me) {
    return interaction.reply({ content: Config.ERROR_MSG });
  }

  const unicode = emojiRegex();
  const custom = /<?(a)?:?(\w{2,32}):(\d{17,19})>?/;

  const quota = interaction.options.getInteger('quota');
  const emoji = interaction.options.getString('emoji');
  const channel = interaction.options.getChannel('channel');

  if (!quota || !emoji || !channel) return interaction.reply({ content: 'You did not choose a valid quota/emoji/channel. Try again!' });
  if (quota < 1) return interaction.reply({ content: 'You did not choose a valid quota. The minimum quota for starboard is 1.' });
  if (channel.type !== ChannelType.GuildText) return interaction.reply({ content: 'You did not choose a valid channel. Try again!' });

  const guildChannel = interaction.guild.channels.cache.get(channel.id);
  if (!guildChannel || !guildChannel.permissionsFor(interaction.guild.members.me).has('ViewChannel')
      || !guildChannel.permissionsFor(interaction.guild.members.me).has('SendMessages')) {
    return interaction.reply({ content: 'I don\'t have permission to send messages in that channel!' });
  }
  if (!unicode.test(emoji) && !custom.test(emoji)) return interaction.reply({ content: 'You did not choose a valid emoji. Try again!' });

  await Starboard.setSettings(quota, emoji, channel.id);
  return interaction.reply({ content: `You have successfully set the Starboard quota at ${quota} ${emoji}, and the channel at ${Formatters.channelMention(channel.id)}` });
}
