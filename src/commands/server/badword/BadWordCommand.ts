import type { ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Config from '../../../Config';
import { badWordAdd, badWordAddSC } from './add/badWordAdd';
import { badWordList, badWordListSC } from './list/badWordList';
import { badWordRemove, badWordRemoveSC } from './remove/badWordRemove';

class BadWordCommand extends SlashCommand {
  public name: string = 'badword';

  public description: string = 'Manage bad words';

  public options: ApplicationCommandOptionData[] = [
    badWordAddSC,
    badWordListSC,
    badWordRemoveSC,
  ];

  async run(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return interaction.reply({ content: Config.ERROR_MSG });
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'list') return badWordList(interaction);
    if (subcommand === 'add') return badWordAdd(interaction);
    if (subcommand === 'remove') return badWordRemove(interaction);

    return null;
  }
}

export default new BadWordCommand();
