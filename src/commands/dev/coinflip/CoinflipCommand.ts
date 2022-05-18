import { CommandInteraction, EmbedBuilder, SlashCommandBuilder } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Member from '../../../storage/Member';
import CurrencyUtils from '../../../utils/CurrencyUtils';
import MemberCache from '../../../cache/MemberCache';

class CoinflipCommand extends SlashCommand {
  async execute(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });
    const bet = interaction.options.getInteger('bet');
    if (!bet) return interaction.reply({ content: 'You did not choose a valid bet amount. Try again!', ephemeral: true });
    const side = interaction.options.getString('side');
    if (!side) return interaction.reply({ content: 'You did not choose a valid side. Try again!', ephemeral: true });

    const member = MemberCache.initialiseIfNotExists(interaction.user.id);
    if (!member) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });

    let bal = Member.getCoin(interaction.user.id);
    if (bal === null) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });
    if (bal < bet) return interaction.reply(`You do not have enough coins to make the bet! You have ${CurrencyUtils.formatEmoji(bal)}`);

    bal = Member.deductCoin(interaction.user.id, bet);
    if (bal === null) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });

    let description = `You bet ${bet} ${bet === 1 ? 'coin' : 'coins'} on **${side}**.`;
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
      const newBal = Member.addCoin(interaction.user.id, bet * 2);
      result = `\nYou won ${CurrencyUtils.format(bet)}! You now have ${CurrencyUtils.formatEmoji(newBal ?? 0)}`;
    } else {
      result = `\nYou lost. You now have ${CurrencyUtils.formatEmoji(bal)}`;
    }

    const embed = new EmbedBuilder()
      .setTitle('Coin flip!')
      .setDescription(description)
      .addFields([{ name: 'Result', value: result }]);

    return interaction.reply({ embeds: [embed] });
  }
}
export const builder = new SlashCommandBuilder()
  .setName('coinflip')
  .setDescription('Flip a coin!')
  .addIntegerOption((option) => option
    .setName('bet')
    .setDescription('The amount of coins to bet')
    .setMinValue(1)
    .setMaxValue(50)
    .setRequired(true))
  .addStringOption((option) => option
    .setName('side')
    .setDescription('Heads or Tails?')
    .setChoices(
      { name: 'Heads', value: 'Heads' },
      { name: 'Tails', value: 'Tails' },
    )
    .setRequired(true));

export default new CoinflipCommand();
