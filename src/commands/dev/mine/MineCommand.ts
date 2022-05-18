import { CommandInteraction, Formatters, SlashCommandBuilder } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Member from '../../../storage/Member';
import WorkData from '../../../storage/WorkData';
import CurrencyUtils from '../../../utils/CurrencyUtils';
import MemberCache from '../../../cache/MemberCache';

class MineCommand extends SlashCommand {
  async execute(interaction: CommandInteraction) {
    const member = MemberCache.initialiseIfNotExists(interaction.user.id);
    if (!member) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });

    const mineData = WorkData.getMine(interaction.user.id);
    if (!mineData) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });

    const lastMined = mineData.last_mine;
    const nextReset = new Date(lastMined + 6 * 60 * 60 * 1000);
    if (Date.now() - lastMined < 6 * 60 * 60 * 1000) return interaction.reply({ content: `You've just mined recently! Try again ${Formatters.time(nextReset, 'R')}`, ephemeral: true });

    const earnings = Math.floor(Math.random() * 300) + 200;
    const operation = WorkData.incrementMine(interaction.user.id, Date.now(), earnings);
    if (!operation) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });

    const updatedCoin = Member.getCoin(interaction.user.id);
    return interaction.reply({ content: `You went mining and earned ${CurrencyUtils.format(earnings)}! You now have ${CurrencyUtils.formatEmoji(updatedCoin ?? 0)}` });
  }
}

export const builder = new SlashCommandBuilder().setName('mine').setDescription('Mine for income!');

export default new MineCommand();
