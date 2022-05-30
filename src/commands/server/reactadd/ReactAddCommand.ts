import type { ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Config from '../../../Config';
import ReactCache from '../../../cache/ReactCache';

class ReactAddCommand extends SlashCommand {
  public name: string = 'reactadd';

  public description: string = 'Add a reaction GIF';

  public options: ApplicationCommandOptionData[] = [
    {
      name: 'type',
      description: 'Type of reaction',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
    {
      name: 'url',
      description: 'URL of the GIF',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ];

  async run(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return interaction.reply({ content: Config.ERROR_MSG });
    const type = interaction.options.getString('type');
    if (!type) return interaction.reply({ content: 'You did not choose a valid type. Try again!' });
    const url = interaction.options.getString('url');
    if (!url) return interaction.reply({ content: 'You did not choose a valid URL. Try again!' });

    const op = ReactCache.addUrl(type, url);
    if (!op) return interaction.reply({ content: 'The same GIF already exists!' });
    return interaction.reply({ content: 'The GIF was added!' });
  }
}

export default new ReactAddCommand();
