import type { ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Config from '../../../Config';
import { anilistAdd, anilistCommandAddSC } from './add/anilistAdd';
import { anilistCommandDelSC, anilistDel } from './del/anilistDel';

class AnilistCommand extends SlashCommand {
  public name: string = 'anilist';

  public description: string = 'Manage anime tracking';

  public options: ApplicationCommandOptionData[] = [
    anilistCommandAddSC,
    anilistCommandDelSC,
  ];

  async run(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return interaction.reply({ content: Config.ERROR_MSG });
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'add') return anilistAdd(interaction);
    if (subcommand === 'remove') return anilistDel(interaction);

    return null;
  }
}

export default new AnilistCommand();
