import type { ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import { activityChannelList, activityCommandListSC } from './list/ActivityChannelList';
import { activityChannelAdd, activityCommandAddSC } from './add/ActivityChannelAdd';
import { activityChannelRemove, activityCommandRemoveSC } from './remove/ActivityChannelRemove';
import Config from '../../../Config';

class ActivityChannelCommand extends SlashCommand {
  public name: string = 'activity_channel';

  public description: string = 'Manage channels to be tracked for activity';

  public options: ApplicationCommandOptionData[] = [
    activityCommandListSC,
    activityCommandAddSC,
    activityCommandRemoveSC,
  ];

  async run(interaction: CommandInteraction) {
    if (!interaction.isChatInputCommand()) return interaction.reply({ content: Config.ERROR_MSG });
    const subcommand = interaction.options.getSubcommand();

    if (subcommand === 'list') return activityChannelList(interaction);
    if (subcommand === 'add') return activityChannelAdd(interaction);
    if (subcommand === 'remove') return activityChannelRemove(interaction);

    return null;
  }
}

export default new ActivityChannelCommand();
