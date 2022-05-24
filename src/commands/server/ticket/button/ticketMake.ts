import {
  ActionRowBuilder,
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  ButtonBuilder,
  ButtonStyle,
  ChannelType,
  ChatInputCommandInteraction,
} from 'discord.js';
import Config from '../../../../Config';

export const ticketMakeSC: ApplicationCommandSubCommandData = {
  name: 'make',
  description: 'Create a button for tickets',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'channel',
      description: 'The channel to create the button in',
      type: ApplicationCommandOptionType.Channel,
      required: true,
    },
  ],
};

export async function ticketMake(interaction: ChatInputCommandInteraction) {
  if (!interaction.client.user || !interaction.inCachedGuild()) {
    return interaction.reply({ content: Config.ERROR_MSG });
  }
  const channel = interaction.options.getChannel('channel');
  if (!channel || channel.type !== ChannelType.GuildText) return interaction.reply({ content: 'You did not choose a valid channel. Try again!' });
  if (!channel.permissionsFor(interaction.client.user)?.has('SendMessages')) {
    return interaction.reply({ content: 'I do not have permission to send messages in that channel!' });
  }

  const button = new ButtonBuilder()
    .setLabel('Open a ticket')
    .setEmoji('🎫')
    .setStyle(ButtonStyle.Success)
    .setCustomId('create-ticket');

  await channel.send({
    components: [new ActionRowBuilder<ButtonBuilder>()
      .addComponents([button])],
  });

  return interaction.reply({ content: 'Button created!', ephemeral: true });
}
