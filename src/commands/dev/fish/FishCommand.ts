import { CommandInteraction, Formatters, SlashCommandBuilder } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Member from '../../../storage/Member';
import WorkData from '../../../storage/WorkData';
import CurrencyUtils from '../../../utils/CurrencyUtils';
import MemberCache from '../../../cache/MemberCache';

class FishCommand extends SlashCommand {
  async execute(interaction: CommandInteraction) {
    const member = MemberCache.initialiseIfNotExists(interaction.user.id);
    if (!member) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });

    const fishData = WorkData.getFish(interaction.user.id);
    if (!fishData) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });

    const lastFished = fishData.last_fish;
    const nextReset = new Date(lastFished + 4 * 60 * 60 * 1000);
    if (Date.now() - lastFished < 4 * 60 * 60 * 1000) return interaction.reply({ content: `You've just fished recently! Try again ${Formatters.time(nextReset, 'R')}`, ephemeral: true });

    const earnings = Math.floor(Math.random() * 200) + 100;
    const operation = WorkData.incrementFish(interaction.user.id, Date.now(), earnings);
    if (!operation) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });

    const updatedCoin = Member.getCoin(interaction.user.id);
    return interaction.reply({ content: `You went fishing and earned ${CurrencyUtils.format(earnings)}! You now have ${CurrencyUtils.formatEmoji(updatedCoin ?? 0)}` });
  }
}

export const builder = new SlashCommandBuilder().setName('fish').setDescription('Fish for income!');

export default new FishCommand();
