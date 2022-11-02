import type { ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Config from '../../../Config';
import { configList, configListSC } from './list/configList';
import { configTicketCategory, configTicketCategorySC } from './ticketCategory/configTicketCategory';
import { configTicketModRole, configTicketModRoleSC } from './ticketModRole/configTicketModRole';
import { configStarboard, configStarboardSC } from './starboard/configStarboard';
import { configAddAutoRole, configAddAutoRoleSC } from './addAutoRole/configAddAutoRole';
import { configDelAutoRole, configDelAutoRoleSC } from './delAutoRole/configDelAutoRole';
import { configAnilistChannel, configAnilistChannelSC } from './anilistChannel/configAnilistChannel';
import { configAnilistRole, configAnilistRoleSC } from './anilistRole/configAnilistRole';

class ConfigCommand extends SlashCommand {
  public name: string = 'config';

  public description: string = 'Configure server settings';

  public options: ApplicationCommandOptionData[] = [
    configListSC,
    configTicketCategorySC,
    configTicketModRoleSC,
    configStarboardSC,
    configAddAutoRoleSC,
    configDelAutoRoleSC,
    configAnilistChannelSC,
    configAnilistRoleSC,
  ];

  async run(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return interaction.reply({ content: Config.ERROR_MSG });
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'list') return configList(interaction);
    if (subcommand === 'set_ticket_category') return configTicketCategory(interaction);
    if (subcommand === 'set_ticketmod_role') return configTicketModRole(interaction);
    if (subcommand === 'set_anilist_channel') return configAnilistChannel(interaction);
    if (subcommand === 'set_anilist_role') return configAnilistRole(interaction);
    if (subcommand === 'set_starboard') return configStarboard(interaction);
    if (subcommand === 'add_autorole') return configAddAutoRole(interaction);
    if (subcommand === 'del_autorole') return configDelAutoRole(interaction);

    return null;
  }
}

export default new ConfigCommand();
