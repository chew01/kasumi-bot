import { ApplicationCommandOptionData, CommandInteraction, time } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Member from '../../../storage/models/Member';
import WorkData from '../../../storage/models/WorkData';
import CurrencyUtils from '../../../utils/CurrencyUtils';
import Config from '../../../Config';

class FishCommand extends SlashCommand {
  public name: string = 'fish';

  public description: string = 'Fish for income (4hr cooldown)';

  public options: ApplicationCommandOptionData[] = [];

  async run(interaction: CommandInteraction) {
    const lastFished = WorkData.getFish(interaction.user.id);
    const nextReset = new Date(lastFished + Config.FISHING_COOLDOWN);

    if (new Date() < nextReset) return interaction.reply({ content: `You've just fished recently! Try again ${time(nextReset, 'R')}` });

    const earnings = Config.FISHING_MIN_REWARD
            + Math.floor(Math.random() * (Config.FISHING_MAX_REWARD - Config.FISHING_MIN_REWARD));
    const op = WorkData.incrementFish(interaction.user.id, Date.now(), earnings);
    if (!op) return interaction.reply({ content: Config.ERROR_MSG });

    const bal = Member.getBalance(interaction.user.id);
    return interaction.reply({ content: `You went fishing and earned ${CurrencyUtils.format(earnings)}! You now have ${CurrencyUtils.formatEmoji(bal)}` });
  }
}

export default new FishCommand();
