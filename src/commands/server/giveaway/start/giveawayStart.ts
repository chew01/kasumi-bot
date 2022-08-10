import {
  ApplicationCommandOptionType,
  ApplicationCommandSubCommandData,
  ChatInputCommandInteraction,
  EmbedBuilder,
  time,
  userMention,
} from 'discord.js';
import dayjs from 'dayjs';
import GiveawayManager from '../../../../modules/GiveawayManager';
import Config from '../../../../Config';

export const giveawayStartSC: ApplicationCommandSubCommandData = {
  name: 'start',
  description: 'Start a giveaway in the current channel',
  type: ApplicationCommandOptionType.Subcommand,
  options: [
    {
      name: 'draw_time',
      description: 'Set the draw time in DDMMYY HHMM format (EST timezone)',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'prize',
      description: 'Set the prize to be given out',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ],
};

export async function giveawayStart(interaction: ChatInputCommandInteraction) {
  if (!interaction.inCachedGuild() || !interaction.channel) {
    return interaction.reply({ content: Config.ERROR_MSG, ephemeral: true });
  }

  const drawTime = interaction.options.getString('draw_time');
  if (!drawTime) return interaction.reply({ content: 'You did not enter a valid draw time!', ephemeral: true });
  const prize = interaction.options.getString('prize');
  if (!prize) return interaction.reply({ content: 'You did not enter a valid prize!', ephemeral: true });

  const parsedTime = dayjs(drawTime, 'DDMMYY HHmm', true);
  if (!parsedTime.isValid()) {
    return interaction.reply({
      content: 'Draw time is not in correct format!',
      ephemeral: true,
    });
  }

  const embed = new EmbedBuilder()
    .setTitle('🎉 Giveaway 🎉')
    .setDescription(`${userMention(interaction.user.id)} is organizing a giveaway!\nThis giveaway will end ${time(parsedTime.toDate(), 'R')}\nPrize: **${prize}**`)
    .addFields([
      { name: 'Required Roles', value: 'None' },
      { name: 'Bypass Roles', value: 'None' },
      { name: 'Multiplier Roles', value: 'None' },
    ])
    .setTimestamp(parsedTime.toDate());

  const msg = await interaction.channel.send({ embeds: [embed] });
  GiveawayManager.start(msg.id, msg.channel.id, parsedTime.toDate(), prize, interaction.user.id);
  await msg.edit({ embeds: [embed.setFooter({ text: `ID: ${msg.id}` })] });
  await msg.react('🎉');
  return interaction.reply({
    content: 'Started a new giveaway! Use /giveaway add_role to add role options!',
    ephemeral: true,
  });
}
