import {
  ActionRowBuilder,
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  MessageComponentInteraction,
  userMention,
} from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Inventory from '../../../storage/models/Inventory';
import Config from '../../../Config';
import MathUtils from '../../../utils/MathUtils';

class TradeCommand extends SlashCommand {
  public name: string = 'trade';

  public description: string = 'Trade with another user';

  public options: ApplicationCommandOptionData[] = [
    {
      name: 'your_item',
      description: 'The item you want to offer',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'your_quantity',
      description: 'The quantity you want to offer',
      type: ApplicationCommandOptionType.Integer,
      minValue: 0,
      required: true,
    },
    {
      name: 'user',
      description: 'The user you want to trade with',
      type: ApplicationCommandOptionType.User,
      required: true,
    },
    {
      name: 'their_item',
      description: 'The item you want to trade for',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'their_quantity',
      description: 'The quantity you want to trade for',
      type: ApplicationCommandOptionType.Integer,
      minValue: 0,
      required: true,
    },
  ];

  async run(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand() || !interaction.inCachedGuild()) {
      return interaction.reply({ content: Config.ERROR_MSG });
    }
    const yourItem = interaction.options.getString('your_item');
    const yourQty = interaction.options.getInteger('your_quantity');
    const user = interaction.options.getUser('user');
    const theirItem = interaction.options.getString('their_item');
    const theirQty = interaction.options.getInteger('their_quantity');
    if (!yourItem || !yourQty || !user || !theirItem || !theirQty) return interaction.reply({ content: 'You entered an invalid parameter. Try again!' });

    const yourOwned = Inventory.getQuantityOwned(interaction.user.id, yourItem);
    if (yourOwned < yourQty) return interaction.reply({ content: `You do not own **${yourQty}x ${yourItem}**.` });
    const theirOwned = Inventory.getQuantityOwned(user.id, theirItem);
    if (theirOwned < theirQty) return interaction.reply({ content: `Your target does not own **${theirQty}x ${theirItem}**.` });

    const embed = new EmbedBuilder()
      .setTitle('Trade Request!')
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .setDescription(`${userMention(interaction.user.id)} wants to trade with you!`)
      .setTimestamp()
      .setFooter({ text: `This trade request will expire in ${MathUtils.msToMinutes(Config.TRADE_EXPIRY, 0)} minutes.` })
      .addFields([{ name: 'Their offer', value: `${yourQty}x ${yourItem}`, inline: true },
        { name: 'They want', value: `${theirQty}x ${theirItem}`, inline: true }]);

    const accept = new ButtonBuilder()
      .setLabel('Accept')
      .setCustomId('accept')
      .setEmoji(':Minecraft_Accept:976472184723767416')
      .setStyle(ButtonStyle.Success);
    const reject = new ButtonBuilder()
      .setLabel('Reject')
      .setCustomId('reject')
      .setEmoji(':Minecraft_Deny:976472248477175818')
      .setStyle(ButtonStyle.Danger);
    const cancel = new ButtonBuilder()
      .setLabel('Cancel')
      .setCustomId('cancel')
      .setStyle(ButtonStyle.Secondary);
    const row = new ActionRowBuilder<ButtonBuilder>()
      .addComponents([accept, reject, cancel]);

    const msg = await interaction.reply({
      content: `${userMention(user.id)}`, embeds: [embed], components: [row], fetchReply: true,
    });

    const filter = (i: MessageComponentInteraction) => (['accept', 'reject'].includes(i.customId) && i.user.id === user.id)
            || (i.customId === 'cancel' && i.user.id === interaction.user.id);
    const collector = msg.createMessageComponentCollector({ filter, time: Config.TRADE_EXPIRY });

    collector.on('collect', async (i) => {
      if (i.customId === 'accept') {
        const op = Inventory.trade(
          interaction.user.id,
          yourItem,
          yourQty,
          user.id,
          theirItem,
          theirQty,
        );
        if (!op) {
          const failEmbed = new EmbedBuilder()
            .setTitle('Trade failed!')
            .setDescription('The trade process failed. Please try again later.');
          await i.update({
            content: `${userMention(interaction.user.id)} ${userMention(user.id)}`,
            embeds: [failEmbed],
            components: [],
          });
        } else {
          const completeEmbed = new EmbedBuilder()
            .setTitle('Trade complete!')
            .setDescription(`${userMention(interaction.user.id)} received **${theirQty}x ${theirItem}**.\n${userMention(user.id)} received **${yourQty}x ${yourItem}**.`);
          await i.update({
            content: `${userMention(interaction.user.id)}`,
            embeds: [completeEmbed],
            components: [],
          });
          collector.stop();
        }
      }
      if (i.customId === 'reject') {
        const rejectEmbed = new EmbedBuilder()
          .setTitle('Trade request rejected!')
          .setDescription(`${userMention(user.id)} rejected your trade request.`);
        await i.update({ content: `${userMention(interaction.user.id)}`, embeds: [rejectEmbed], components: [] });
        collector.stop();
      }
      if (i.customId === 'cancel') {
        const cancelEmbed = new EmbedBuilder()
          .setTitle('Trade request cancelled')
          .setDescription(`This trade request was cancelled by ${userMention(interaction.user.id)}`);
        await i.update({ content: '', embeds: [cancelEmbed], components: [] });
        collector.stop();
      }
    });

    return null;
  }
}

export default new TradeCommand();
