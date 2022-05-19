import { CommandInteraction, Formatters } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import WorkData from '../../../storage/models/WorkData';
import Member from '../../../storage/models/Member';
import Config from '../../../Config';
import CurrencyUtils from '../../../utils/CurrencyUtils';

class DailyCommand extends SlashCommand {
  public name = 'daily';

  public description = 'Get daily login rewards (refresh at 5AM EST)';

  public options = [];

  async run(interaction: CommandInteraction) {
    const resetTime = new Date();
    resetTime.setHours(0, 0, 0, 0);

    const dailyData = WorkData.getDaily(interaction.user.id);
    const lastClaimed = new Date(dailyData.last_daily);
    const timeNow = Date.now();
    const previousReset = new Date(resetTime.getTime() - 24 * 60 * 60 * 1000);

    // Already claimed today
    if (lastClaimed >= resetTime) {
      const nextReset = new Date(resetTime.getTime() + 24 * 60 * 60 * 1000);
      return interaction.reply({ content: `You've already claimed your daily ${Config.CURRENCY_NAME_PLURAL}! Try again ${Formatters.time(nextReset, 'R')}` });
    }

    // Did not claim yesterday
    if (lastClaimed < previousReset) {
      const op = WorkData.incrementDaily(
        interaction.user.id,
        timeNow,
        Config.BASE_DAILY_INCOME,
        { streak: false },
      );
      if (!op) return interaction.reply({ content: Config.ERROR_MSG });
      const bal = Member.getBalance(interaction.user.id);
      return interaction.reply({ content: `You claimed your daily ${Config.CURRENCY_NAME_PLURAL}! You now have ${CurrencyUtils.formatEmoji(bal)}` });
    }

    // Claimed yesterday and is on 9th day
    if ((dailyData.daily_streak + 1) % 10 === 0) {
      const op = WorkData.incrementDaily(
        interaction.user.id,
        timeNow,
        Config.BASE_DAILY_INCOME,
        { streak: true, gift: true },
      );
      if (!op) return interaction.reply({ content: Config.ERROR_MSG });
      const bal = Member.getBalance(interaction.user.id);
      return interaction.reply({
        content: `You claimed your daily ${Config.CURRENCY_NAME_PLURAL}! You now have ${CurrencyUtils.formatEmoji(bal)}\nYou've logged in for **${dailyData.daily_streak + 1}** consecutive days.\nYou received a gift for logging in 10 days in a row!`,
      });
    }

    // Claimed yesterday and not on 9th day
    const op = WorkData.incrementDaily(
      interaction.user.id,
      timeNow,
      Config.BASE_DAILY_INCOME,
      { streak: true },
    );
    if (!op) return interaction.reply({ content: Config.ERROR_MSG });
    const bal = Member.getBalance(interaction.user.id);
    return interaction.reply({
      content: `You claimed your daily ${Config.CURRENCY_NAME_PLURAL}! You now have ${CurrencyUtils.formatEmoji(bal)}\nYou've logged in for **${dailyData.daily_streak + 1}** consecutive days.`,
    });
  }
}

export default new DailyCommand();
