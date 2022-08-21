import type { ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import { EmbedBuilder } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Config from '../../../Config';
import ReactCache from '../../../cache/ReactCache';

class ReactListCommand extends SlashCommand {
  public name: string = 'reactlist';

  public description: string = 'Get a list of available reactions';

  public options: ApplicationCommandOptionData[] = [];

  async run(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return interaction.reply({ content: Config.ERROR_MSG });
    let typeField = '';
    const types = ReactCache.getTypes();
    types.forEach((t) => {
      typeField += `${t}\n`;
    });

    const embed = new EmbedBuilder()
      .setTitle('Available Reactions')
      .setDescription('Here are all the available reaction types you can use!')
      .addFields([{ name: 'Types', value: typeField || 'None' }]);

    return interaction.reply({ embeds: [embed], ephemeral: true });
  }
}

export default new ReactListCommand();
