import type { ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import dayjs from 'dayjs';
import customParseFormat from 'dayjs/plugin/customParseFormat';
import SlashCommand from '../../../types/SlashCommand';
import Config from '../../../Config';
import { giveawayStart, giveawayStartSC } from './start/giveawayStart';
import { giveawayAddRole, giveawayAddRoleSC } from './addRole/giveawayAddRole';
import { giveawayStop, giveawayStopSC } from './stop/giveawayStop';

dayjs.extend(customParseFormat);

class GiveawayCommand extends SlashCommand {
  public name: string = 'giveaway';

  public description: string = 'Start a giveaway in the current channel';

  public options: ApplicationCommandOptionData[] = [
    giveawayStartSC,
    giveawayAddRoleSC,
    giveawayStopSC,
  ];

  async run(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) {
      return interaction.reply({ content: Config.ERROR_MSG, ephemeral: true });
    }
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'start') return giveawayStart(interaction);
    if (subcommand === 'add_role') return giveawayAddRole(interaction);
    if (subcommand === 'stop') return giveawayStop(interaction);
    return null;
  }
}

export default new GiveawayCommand();
