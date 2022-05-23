import { ApplicationCommandOptionData, CommandInteraction, Formatters } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Member from '../../../storage/models/Member';
import WorkData from '../../../storage/models/WorkData';
import CurrencyUtils from '../../../utils/CurrencyUtils';
import Config from '../../../Config';

class MineCommand extends SlashCommand {
  public name: string = 'mine';

  public description: string = 'Mine for income (6hr cooldown)';

  public options: ApplicationCommandOptionData[] = [];

  async run(interaction: CommandInteraction) {
    const lastMined = WorkData.getMine(interaction.user.id);
    const nextReset = new Date(lastMined + Config.MINING_COOLDOWN);

    if (new Date() < nextReset) return interaction.reply({ content: `You've just mined recently! Try again ${Formatters.time(nextReset, 'R')}` });

    const earnings = Config.MINING_MIN_REWARD
        + Math.floor(Math.random() * (Config.MINING_MAX_REWARD - Config.MINING_MIN_REWARD));
    const op = WorkData.incrementMine(interaction.user.id, Date.now(), earnings);
    if (!op) return interaction.reply({ content: Config.ERROR_MSG });

    const bal = Member.getBalance(interaction.user.id);
    return interaction.reply({ content: `You went mining and earned ${CurrencyUtils.format(earnings)}! You now have ${CurrencyUtils.formatEmoji(bal)}` });
  }
}

export default new MineCommand();
