import type { ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Config from '../../../Config';
import { ticketMake, ticketMakeSC } from './button/ticketMake';
import { ticketAddMod, ticketAddModSC } from './addMod/ticketAddMod';
import { ticketClose, ticketCloseSC } from './close/ticketClose';

class TicketCommand extends SlashCommand {
  public name: string = 'ticket';

  public description: string = 'Create a ticketing button in a channel of your choice!';

  public options: ApplicationCommandOptionData[] = [ticketMakeSC, ticketAddModSC, ticketCloseSC];

  async run(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return interaction.reply({ content: Config.ERROR_MSG });
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'make') return ticketMake(interaction);
    if (subcommand === 'add_mod') return ticketAddMod(interaction);
    if (subcommand === 'close') return ticketClose(interaction);

    return null;
  }
}

export default new TicketCommand();
