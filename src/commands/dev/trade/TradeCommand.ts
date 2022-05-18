import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  CommandInteraction,
  EmbedBuilder,
  Formatters,
  MessageComponentInteraction,
  SlashCommandBuilder,
} from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Inventory from '../../../storage/Inventory';

class TradeCommand extends SlashCommand {
  async execute(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand() || !interaction.inCachedGuild()) return interaction.reply({ content: 'Oops, we ran into an error. Try again!' });
    const yourItem = interaction.options.getString('your_item');
    const yourQty = interaction.options.getInteger('your_quantity');
    const user = interaction.options.getUser('user');
    const theirItem = interaction.options.getString('their_item');
    const theirQty = interaction.options.getInteger('their_quantity');
    if (!yourItem || !yourQty || !user || !theirItem || !theirQty) return interaction.reply({ content: 'You entered an invalid parameter. Try again!' });

    const yourCheck = Inventory.checkQuantityOwned(interaction.user.id, yourItem, yourQty);
    if (yourCheck === false) return interaction.reply({ content: `You do not own ${yourQty}x ${yourItem}.` });
    const theirCheck = Inventory.checkQuantityOwned(user.id, theirItem, theirQty);
    if (theirCheck === false) return interaction.reply({ content: `You do not own ${yourQty}x ${yourItem}.` });
    if (yourCheck === null || theirCheck === null) return interaction.reply({ content: 'Oops, we ran into an error. Try again!' });

    const embed = new EmbedBuilder()
      .setTitle('Trade Request!')
      .setDescription(`${Formatters.userMention(interaction.user.id)} wants to trade with you!`)
      .addFields([{ name: 'Their offer:', value: `${yourQty}x ${yourItem}`, inline: true },
        { name: 'They want:', value: `${theirQty}x ${theirItem}`, inline: true }]);

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
      content: `${Formatters.userMention(user.id)}`, embeds: [embed], components: [row], fetchReply: true,
    });

    const filter = (i: MessageComponentInteraction) => (['accept', 'reject'].includes(i.customId) && i.user.id === user.id) || (i.customId === 'cancel' && i.user.id === interaction.user.id);
    const collector = msg.createMessageComponentCollector({ filter, time: 150000 });

    collector.on('collect', async (i) => {
      if (i.customId === 'accept') {
        const operation = Inventory.trade(interaction.user.id, yourItem, yourQty, user.id, theirItem, theirQty);
        if (!operation) {
          const failEmbed = new EmbedBuilder()
            .setTitle('Trade failed!')
            .setDescription('The trade process failed. Please try again later.');
          await i.update({ content: `${Formatters.userMention(interaction.user.id)} ${Formatters.userMention(user.id)}`, embeds: [failEmbed], components: [] });
        } else {
          const completeEmbed = new EmbedBuilder()
            .setTitle('Trade complete!')
            .setDescription(`${Formatters.userMention(interaction.user.id)} received **${theirQty}x ${theirItem}**.\n${Formatters.userMention(user.id)} received **${yourQty}x ${yourItem}**.`);
          await i.update({
            content: `${Formatters.userMention(interaction.user.id)}`,
            embeds: [completeEmbed],
            components: [],
          });
          collector.stop();
        }
      }
      if (i.customId === 'reject') {
        const rejectEmbed = new EmbedBuilder()
          .setTitle('Trade request rejected!')
          .setDescription(`${Formatters.userMention(user.id)} rejected your trade request.`);
        await i.update({ content: `${Formatters.userMention(interaction.user.id)}`, embeds: [rejectEmbed], components: [] });
        collector.stop();
      }
      if (i.customId === 'cancel') {
        const cancelEmbed = new EmbedBuilder()
          .setTitle('Trade request cancelled')
          .setDescription(`This trade request was cancelled by ${Formatters.userMention(interaction.user.id)}`);
        await i.update({ content: '', embeds: [cancelEmbed], components: [] });
        collector.stop();
      }
    });

    return null;
  }
}

export const builder = new SlashCommandBuilder()
  .setName('trade')
  .setDescription('Trade items with another member.')
  .addStringOption((option) => option
    .setName('your_item')
    .setDescription('The item you want to offer.')
    .setRequired(true))
  .addIntegerOption((option) => option
    .setName('your_quantity')
    .setDescription('The quantity you want to offer.')
    .setRequired(true))
  .addUserOption((option) => option
    .setName('user')
    .setDescription('The user you want to trade with.')
    .setRequired(true))
  .addStringOption((option) => option
    .setName('their_item')
    .setDescription('The item you want to trade for.')
    .setRequired(true))
  .addIntegerOption((option) => option
    .setName('their_quantity')
    .setDescription('The quantity you want to trade for.')
    .setRequired(true));

export default new TradeCommand();
