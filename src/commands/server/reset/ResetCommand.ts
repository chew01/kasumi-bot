import type { ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import { ApplicationCommandOptionType } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Config from '../../../Config';
import Variable from '../../../storage/models/Variable';

class ResetCommand extends SlashCommand {
  public name: string = 'reset';

  public description: string = 'Reset variables if they have been tampered with. WARNING: Can have breaking effects!';

  public options: ApplicationCommandOptionData[] = [
    {
      name: 'variable',
      description: 'The variable to set ID for',
      type: ApplicationCommandOptionType.String,
      required: true,
      choices: [
        { name: 'Ticket Category', value: 'ticketcategory' },
        { name: 'Ticket Mod Role', value: 'ticketmodrole' },
      ],
    },
  ];

  async run(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return interaction.reply({ content: Config.ERROR_MSG });
    const variable = interaction.options.getString('variable');
    if (!variable) return interaction.reply({ content: 'You did not choose a valid variable. Try again!' });

    if (variable === 'ticketcategory') {
      const op = Variable.clearTicketCategory();
      if (!op) return interaction.reply({ content: 'There is no existing Ticket Category in the database!' });
      return interaction.reply({ content: 'You have reset the Ticket Category! You can delete the old ticket category safely now.' });
    }

    if (variable === 'ticketmodrole') {
      const op = Variable.clearTicketModRole();
      if (!op) return interaction.reply({ content: 'There is no existing Ticket Mod role in the database!' });
      return interaction.reply({ content: 'You have reset the Ticket Mod role! You can delete the old ticket mod role safely now.' });
    }

    return null;
  }
}

export default new ResetCommand();
