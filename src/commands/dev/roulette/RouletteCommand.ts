import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Member from '../../../storage/Member';
import CurrencyUtils from '../../../utils/CurrencyUtils';
import MemberCache from '../../../cache/MemberCache';

class RouletteCommand extends SlashCommand {
  async execute(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });
    const bet = interaction.options.getInteger('bet');
    if (!bet) return interaction.reply({ content: 'You did not choose a valid bet amount. Try again!', ephemeral: true });

    const num = interaction.options.getInteger('number');
    if (num === null) return interaction.reply({ content: 'You did not choose a valid Roulette number. Try again!', ephemeral: true });

    const member = MemberCache.initialiseIfNotExists(interaction.user.id);
    if (!member) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });

    let bal = Member.getCoin(interaction.user.id);
    if (bal === null) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });
    if (bal < bet) return interaction.reply(`You do not have enough coins to make the bet! You have ${CurrencyUtils.formatEmoji(bal)}`);

    bal = Member.deductCoin(interaction.user.id, bet);
    if (bal === null) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });

    const res = Math.floor(Math.random() * 38);
    const resDivi = res % 2 === 0 ? 'Even' : 'Odd';
    const betDivi = num % 2 === 0 ? 'Even' : 'Odd';
    const resString = `You bet ${CurrencyUtils.format(bet)} on: **${betDivi} / ${num}**`;
    const betString = `The roulette ball spins around... and stops at **${resDivi} / ${res}**`;
    let result = `You lost! You now have ${CurrencyUtils.formatEmoji(bal)}`;

    if (num === res) {
      const newBal = Member.addCoin(interaction.user.id, bet * 35);
      result = `You won! You earned ${CurrencyUtils.format(bet * 35)}.\nYou now have ${CurrencyUtils.formatEmoji(newBal ?? 0)}`;
    }
    if (resDivi === betDivi) {
      const newBal = Member.addCoin(interaction.user.id, bet * 2);
      result = `You bet on the same type of number (${resDivi}). You earned ${CurrencyUtils.format(bet * 2)}.\nYou now have ${CurrencyUtils.formatEmoji(newBal ?? 0)}`;
    }

    const embed = new EmbedBuilder()
      .setTitle('Roulette')
      .setDescription(`${resString}\n${betString}`)
      .addFields([{ name: 'Result', value: result }]);

    return interaction.reply({ embeds: [embed] });
  }
}

export const builder = new SlashCommandBuilder()
  .setName('roulette')
  .setDescription('Play a game of Roulette.')
  .addIntegerOption((option) => option
    .setName('bet')
    .setDescription('The amount of coins to bet')
    .setMinValue(1)
    .setMaxValue(50)
    .setRequired(true))
  .addIntegerOption((option) => option
    .setName('number')
    .setDescription('Choose a number from 0 to 37')
    .setMinValue(0)
    .setMaxValue(37)
    .setRequired(true));

export default new RouletteCommand();
