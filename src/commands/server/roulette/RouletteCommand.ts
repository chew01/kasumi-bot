import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Member from '../../../storage/models/Member';
import CurrencyUtils from '../../../utils/CurrencyUtils';
import Config from '../../../Config';

class RouletteCommand extends SlashCommand {
  public name: string = 'roulette';

  public description: string = 'Play a game of Roulette';

  public options: ApplicationCommandOptionData[] = [{
    name: 'bet',
    description: `Amount of ${Config.CURRENCY_NAME_PLURAL} to bet`,
    type: ApplicationCommandOptionType.Integer,
    minValue: Config.ROULETTE_MIN_BET,
    maxValue: Config.ROULETTE_MAX_BET,
    required: true,
  },
  {
    name: 'number',
    description: 'Choose a number from 0 to 37',
    type: ApplicationCommandOptionType.Integer,
    minValue: 0,
    maxValue: 37,
    required: true,
  }];

  async run(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return interaction.reply({ content: Config.ERROR_MSG });
    const bet = interaction.options.getInteger('bet');
    if (!bet) return interaction.reply({ content: 'You did not choose a valid bet amount. Try again!' });
    const num = interaction.options.getInteger('number');
    if (num === null) return interaction.reply({ content: 'You did not choose a valid Roulette number. Try again!' });

    let bal = Member.getBalance(interaction.user.id);
    if (bal < bet) return interaction.reply(`You do not have enough ${Config.CURRENCY_NAME_PLURAL} to make the bet! You have ${CurrencyUtils.formatEmoji(bal)}`);

    bal = Member.deductMoney(interaction.user.id, bet);

    const res = Math.floor(Math.random() * 38);
    const resDiv = res % 2 === 0 ? 'Even' : 'Odd';
    const betDiv = num % 2 === 0 ? 'Even' : 'Odd';
    const resString = `You bet ${CurrencyUtils.format(bet)} on: **${betDiv} / ${num}**`;
    const betString = `The roulette ball spins around... and stops at **${resDiv} / ${res}**`;
    let result = `You lost! You now have ${CurrencyUtils.formatEmoji(bal)}`;

    if (num === res) {
      bal = Member.addMoney(interaction.user.id, bet * Config.ROULETTE_JACKPOT);
      result = `You won! You earned ${CurrencyUtils.format(bet * Config.ROULETTE_JACKPOT)}.\nYou now have ${CurrencyUtils.formatEmoji(bal)}`;
    }
    if (resDiv === betDiv) {
      bal = Member.addMoney(interaction.user.id, bet * Config.ROULETTE_MULTIPLIER);
      result = `You bet on the same type of number (${resDiv}). You earned ${CurrencyUtils.format(bet * Config.ROULETTE_MULTIPLIER)}.\nYou now have ${CurrencyUtils.formatEmoji(bal)}`;
    }

    const embed = new EmbedBuilder()
      .setTitle('Roulette')
      .setDescription(`${resString}\n${betString}`)
      .addFields([{ name: 'Result', value: result }]);

    return interaction.reply({ embeds: [embed] });
  }
}

export default new RouletteCommand();
