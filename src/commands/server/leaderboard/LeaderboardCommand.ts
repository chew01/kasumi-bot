import type { ApplicationCommandOptionData, CommandInteraction } from 'discord.js';
import SlashCommand from '../../../types/SlashCommand';
import Member from '../../../storage/models/Member';
import Level from '../../../modules/Level';

class LeaderboardCommand extends SlashCommand {
  public name: string = 'leaderboard';

  public description: string = 'Check the server leaderboard!';

  options: ApplicationCommandOptionData[] = [];

  async run(interaction: CommandInteraction) {
    const leaderboard = Member.getLeaderboard(interaction.user.id);
    const carousel = Level.formatLeaderboard(leaderboard);

    return carousel.send(interaction, { displayPageCount: true, timeout: 50000 });
  }
}

export default new LeaderboardCommand();
