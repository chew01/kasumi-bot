import type { ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Config from '../../../Config';
import ReactCache from '../../../cache/ReactCache';

class ReactDelCommand extends SlashCommand {
  public name: string = 'reactdel';

  public description: string = 'Delete a reaction GIF';

  public options: ApplicationCommandOptionData[] = [
    {
      name: 'id',
      description: 'ID of the GIF',
      type: ApplicationCommandOptionType.String,
      required: true,
    },
  ];

  async run(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return interaction.reply({ content: Config.ERROR_MSG });
    const id = interaction.options.getString('id');
    if (!id) return interaction.reply({ content: 'You did not choose a valid ID. Try again!' });

    const op = ReactCache.delId(id);
    if (!op) return interaction.reply({ content: 'That GIF does not exist!' });
    return interaction.reply({ content: 'The GIF was removed!' });
  }
}

export default new ReactDelCommand();
