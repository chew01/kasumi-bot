import { CommandInteraction, SlashCommandBuilder } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Member from '../../../storage/Member';
import CurrencyUtils from '../../../utils/CurrencyUtils';
import MemberCache from '../../../cache/MemberCache';

class BalanceCommand extends SlashCommand {
  async execute(interaction: CommandInteraction) {
    const init = MemberCache.initialiseIfNotExists(interaction.user.id);
    if (!init) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });

    const balance = Member.getCoin(interaction.user.id);
    if (balance === null) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });

    return interaction.reply({ content: `You currently have ${CurrencyUtils.formatEmoji(balance)}`, ephemeral: true });
  }
}

export const builder = new SlashCommandBuilder().setName('balance').setDescription('Checks your coin balance.');

export default new BalanceCommand();
