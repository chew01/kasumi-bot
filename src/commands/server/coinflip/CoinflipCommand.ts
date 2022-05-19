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

class CoinflipCommand extends SlashCommand {
  public name: string = 'coinflip';

  public description: string = 'Flip a coin';

  public options: ApplicationCommandOptionData[] = [{
    name: 'bet',
    description: `Amount of ${Config.CURRENCY_NAME_PLURAL} to bet`,
    type: ApplicationCommandOptionType.Integer,
    minValue: Config.COINFLIP_MIN_BET,
    maxValue: Config.COINFLIP_MAX_BET,
    required: true,
  },
  {
    name: 'side',
    description: 'Heads or Tails?',
    type: ApplicationCommandOptionType.String,
    choices: [{ name: 'Heads', value: 'Heads' }, { name: 'Tails', value: 'Tails' }],
    required: true,
  }];

  async run(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return interaction.reply({ content: Config.ERROR_MSG });
    const bet = interaction.options.getInteger('bet');
    if (!bet) return interaction.reply({ content: 'You did not choose a valid bet amount. Try again!' });
    const side = interaction.options.getString('side');
    if (!side) return interaction.reply({ content: 'You did not choose a valid side. Try again!' });

    let bal = Member.getBalance(interaction.user.id);
    if (bal < bet) return interaction.reply(`You do not have enough ${Config.CURRENCY_NAME_PLURAL} to make the bet! You have ${CurrencyUtils.formatEmoji(bal)}`);

    bal = Member.deductMoney(interaction.user.id, bet);

    let description = `You bet ${CurrencyUtils.format(bet)} on **${side}**.`;
    let result: string;
    const rand = Math.random();
    if (rand < 0.5) {
      result = 'Heads';
      description += '\nThe coin flips in the air...<a:coinflip:976105659835777034>and lands on **Heads**!';
    } else {
      result = 'Tails';
      description += '\nThe coin flips in the air...<a:coinflip:976105659835777034>and lands on **Tails**!';
    }

    if (result === side) {
      bal = Member.addMoney(interaction.user.id, bet * Config.COINFLIP_MULTIPLIER);
      result = `\nYou won ${CurrencyUtils.format(bet)}! You now have ${CurrencyUtils.formatEmoji(bal)}`;
    } else {
      result = `\nYou lost. You now have ${CurrencyUtils.formatEmoji(bal)}`;
    }

    const embed = new EmbedBuilder()
      .setTitle('Coin Flip!')
      .setDescription(description)
      .setAuthor({ name: interaction.user.username, iconURL: interaction.user.displayAvatarURL() })
      .addFields([{ name: 'Result', value: result }]);

    return interaction.reply({ embeds: [embed] });
  }
}

export default new CoinflipCommand();
