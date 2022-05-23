import type { ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Member from '../../../storage/models/Member';
import CurrencyUtils from '../../../utils/CurrencyUtils';
import Config from '../../../Config';

class BalanceCommand extends SlashCommand {
  public name: string = 'balance';

  public description: string = `Check your ${Config.CURRENCY_NAME} balance`;

  public options: ApplicationCommandOptionData[] = [];

  async run(interaction: CommandInteraction) {
    const balance = Member.getBalance(interaction.user.id);

    return interaction.reply({ content: `You currently have ${CurrencyUtils.formatEmoji(balance)}` });
  }
}

export default new BalanceCommand();
