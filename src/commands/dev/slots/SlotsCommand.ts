import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Member from '../../../storage/Member';
import CurrencyUtils from '../../../utils/CurrencyUtils';
import Slots from '../../../modules/Slots';
import MemberCache from '../../../cache/MemberCache';

class SlotsCommand extends SlashCommand {
  async execute(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return interaction.reply({ content: 'Oops, we ran into an error. Try again!' });
    const bet = interaction.options.getInteger('bet');
    if (!bet) return interaction.reply({ content: 'You did not choose a valid bet amount. Try again!', ephemeral: true });

    const member = MemberCache.initialiseIfNotExists(interaction.user.id);
    if (!member) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });

    let bal = Member.getCoin(interaction.user.id);
    if (bal === null) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });
    if (bal < bet) return interaction.reply(`You do not have enough coins to make the bet! You have ${CurrencyUtils.formatEmoji(bal)}`);

    bal = Member.deductCoin(interaction.user.id, bet);
    if (bal === null) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });

    const slots = new Slots();
    const game = slots.get();
    if (game.length !== 9) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });

    let display = `${game[0]}\n\n${game[3]}\n\n${game[6]}`;
    const description = `You bet ${CurrencyUtils.format(bet)}.`;
    const line = '------------------';

    let embed = new EmbedBuilder().setTitle('Slots').setDescription(`${description}\n${line}\n${display}\n${line}`);
    await interaction.reply({ embeds: [embed] });

    // Second column
    display = `${game[0]} : ${game[1]}\n\n${game[3]} : ${game[4]}\n\n${game[6]} : ${game[7]}`;
    embed = embed.setDescription(`${description}\n${line}\n${display}\n${line}`);
    setTimeout(() => {}, 1000);
    await interaction.editReply({ embeds: [embed] });

    const result = { name: 'Result', value: `You lost! You now have ${CurrencyUtils.formatEmoji(bal)}` };
    const check = slots.checkWin();
    if (check) {
      bal = Member.addCoin(interaction.user.id, bet * check);
      result.value = `You won! You earned ${CurrencyUtils.format(bet * check)}. You now have ${CurrencyUtils.formatEmoji(bal)}`;
    }

    // Third column
    display = `${game[0]} : ${game[1]} : ${game[2]}\n\n${game[3]} : ${game[4]} : ${game[5]} <\n\n${game[6]} : ${game[7]} : ${game[8]}`;
    embed = embed.setDescription(`${description}\n${line}\n${display}\n${line}`).addFields([result]);
    setTimeout(() => {}, 1000);
    return interaction.editReply({ embeds: [embed] });
  }
}

export const builder = new SlashCommandBuilder()
  .setName('slots')
  .setDescription('Play a game of Slots.')
  .addIntegerOption((option) => option
    .setName('bet')
    .setDescription('The amount of coins to bet')
    .setMinValue(1)
    .setMaxValue(50)
    .setRequired(true));

export default new SlotsCommand();
