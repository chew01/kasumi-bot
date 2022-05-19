import { CommandInteraction, Formatters } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Member from '../../../storage/models/Member';
import WorkData from '../../../storage/models/WorkData';
import CurrencyUtils from '../../../utils/CurrencyUtils';
import Config from '../../../Config';

class MineCommand extends SlashCommand {
  public name = 'mine';

  public description = 'Mine for income (6hr cooldown)';

  public options = [];

  async run(interaction: CommandInteraction) {
    const lastMined = WorkData.getMine(interaction.user.id);
    const nextReset = lastMined + Config.MINING_COOLDOWN;

    if (Date.now() < nextReset) return interaction.reply({ content: `You've just mined recently! Try again ${Formatters.time(nextReset, 'R')}` });

    const earnings = Config.MINING_MIN_REWARD
        + Math.floor(Math.random() * (Config.MINING_MAX_REWARD - Config.MINING_MIN_REWARD));
    const op = WorkData.incrementMine(interaction.user.id, Date.now(), earnings);
    if (!op) return interaction.reply({ content: Config.ERROR_MSG });

    const bal = Member.getBalance(interaction.user.id);
    return interaction.reply({ content: `You went mining and earned ${CurrencyUtils.format(earnings)}! You now have ${CurrencyUtils.formatEmoji(bal)}` });
  }
}

export default new MineCommand();
