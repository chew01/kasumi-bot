import {
  ApplicationCommandOptionData,
  ApplicationCommandOptionType,
  CommandInteraction,
  EmbedBuilder,
} from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Member from '../../../storage/models/Member';
import CurrencyUtils from '../../../utils/CurrencyUtils';
import Slots from '../../../modules/games/Slots';
import Config from '../../../Config';

class SlotsCommand extends SlashCommand {
  public name: string = 'slots';

  public description: string = 'Play a game of Slots';

  public options: ApplicationCommandOptionData[] = [{
    name: 'bet',
    description: `Amount of ${Config.CURRENCY_NAME_PLURAL} to bet`,
    type: ApplicationCommandOptionType.Integer,
    minValue: Config.SLOTS_MIN_BET,
    maxValue: Config.SLOTS_MAX_BET,
    required: true,
  }];

  async run(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return interaction.reply({ content: Config.ERROR_MSG });
    const bet = interaction.options.getInteger('bet');
    if (!bet) return interaction.reply({ content: 'You did not choose a valid bet amount. Try again!' });

    let bal = Member.getBalance(interaction.user.id);
    if (bal < bet) return interaction.reply(`You do not have enough ${Config.CURRENCY_NAME_PLURAL} to make the bet! You have ${CurrencyUtils.formatEmoji(bal)}`);

    bal = Member.deductMoney(interaction.user.id, bet);

    const slots = new Slots();
    const game = slots.get();
    if (game.length !== 9) return interaction.reply({ content: Config.ERROR_MSG });

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
      bal = Member.addMoney(interaction.user.id, bet * check);
      result.value = `You won! You earned ${CurrencyUtils.format(bet * check)}. You now have ${CurrencyUtils.formatEmoji(bal)}`;
    }

    // Third column
    display = `${game[0]} : ${game[1]} : ${game[2]}\n\n${game[3]} : ${game[4]} : ${game[5]} <\n\n${game[6]} : ${game[7]} : ${game[8]}`;
    embed = embed.setDescription(`${description}\n${line}\n${display}\n${line}`).addFields([result]);
    setTimeout(() => {}, 1000);
    return interaction.editReply({ embeds: [embed] });
  }
}

export default new SlotsCommand();
