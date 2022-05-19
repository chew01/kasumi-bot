import type { CommandInteraction } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Member from '../../../storage/models/Member';
import CurrencyUtils from '../../../utils/CurrencyUtils';
import Config from '../../../Config';

class BalanceCommand extends SlashCommand {
  public name = 'balance';

  public description = `Check your ${Config.CURRENCY_NAME} balance`;

  public options = [];

  async run(interaction: CommandInteraction) {
    const balance = Member.getBalance(interaction.user.id);

    return interaction.reply({ content: `You currently have ${CurrencyUtils.formatEmoji(balance)}` });
  }
}

export default new BalanceCommand();
