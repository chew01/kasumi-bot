import type { ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Config from '../../../Config';
import { configList, configListSC } from './list/configList';
import { configTicketCategory, configTicketCategorySC } from './ticketCategory/configTicketCategory';
import { configTicketModRole, configTicketModRoleSC } from './ticketModRole/configTicketModRole';

class ConfigCommand extends SlashCommand {
  public name: string = 'config';

  public description: string = 'Configure server settings';

  public options: ApplicationCommandOptionData[] = [
    configListSC,
    configTicketCategorySC,
    configTicketModRoleSC];

  async run(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return interaction.reply({ content: Config.ERROR_MSG });
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'list') return configList(interaction);
    if (subcommand === 'set_ticket_category') return configTicketCategory(interaction);
    if (subcommand === 'set_ticketmod_role') return configTicketModRole(interaction);

    return null;
  }
}

export default new ConfigCommand();
