import { CommandInteraction, Formatters, SlashCommandBuilder } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import WorkData from '../../../storage/WorkData';
import Member from '../../../storage/Member';
import MemberCache from '../../../cache/MemberCache';

class DailyCommand extends SlashCommand {
  async execute(interaction: CommandInteraction) {
    const resetTime = new Date();
    resetTime.setHours(0, 0, 0, 0);

    const member = MemberCache.initialiseIfNotExists(interaction.user.id);
    if (!member) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });

    const dailyData = WorkData.getDaily(interaction.user.id);
    if (!dailyData) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });

    const lastClaimed = new Date(dailyData.last_daily);
    // Already claimed today
    if (lastClaimed >= resetTime) {
      const nextReset = new Date(resetTime.getTime() + 24 * 60 * 60 * 1000);
      return interaction.reply({ content: `You've already claimed your daily coins today! Try again ${Formatters.time(nextReset, 'R')}`, ephemeral: true });
    }

    const timeNow = Date.now();
    const previousReset = new Date(resetTime.getTime() - 24 * 60 * 60 * 1000);
    // Did not claim yesterday
    if (lastClaimed < previousReset) {
      const operation = WorkData.incrementDaily(interaction.user.id, timeNow, 100, { streak: false });
      if (!operation) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });
      const updatedCoin = Member.getCoin(interaction.user.id);
      return interaction.reply({ content: `You've claimed your daily coins! You currently have ${updatedCoin}` });
    }

    // Claimed yesterday and is on 9th day
    if ((dailyData.daily_streak + 1) % 10 === 0) {
      const operation = WorkData.incrementDaily(interaction.user.id, timeNow, 100, { streak: true, gift: true });
      if (!operation) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });
      const updatedCoin = Member.getCoin(interaction.user.id);
      return interaction.reply({ content: `You've claimed your daily coins! You currently have ${updatedCoin}. You also received a gift for logging in 10 days in a row!` });
    }

    // Claimed yesterday and not on 9th day
    const operation = WorkData.incrementDaily(interaction.user.id, timeNow, 100, { streak: true });
    if (!operation) return interaction.reply({ content: 'Oops, we ran into an error. Try again!', ephemeral: true });
    const updatedCoin = Member.getCoin(interaction.user.id);
    return interaction.reply({ content: `You've claimed your daily coins! You currently have ${updatedCoin}` });
  }
}

export const builder = new SlashCommandBuilder().setName('daily').setDescription('Get coins for daily login.');

export default new DailyCommand();
