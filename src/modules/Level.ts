import {
  ButtonBuilder, ButtonStyle, EmbedBuilder, GuildMember, Message, userMention,
} from 'discord.js';
import { Carousel } from 'cordyceps';
import type { LeaderboardType, LevelDataType } from '../storage/models/Member';
import Config from '../Config';
import Inventory from '../storage/models/Inventory';

export default class Level {
  public static async check(
    data: LevelDataType,
    member: GuildMember,
    message?: Message,
  ): Promise<void> {
    // No change in levels (joined)
    if (data.level === data.previousLevel) {
      // If member less than Level 5 and does not have Level 1 role
      if (data.level < 5 && Config.LEVEL_ROLES[0]
                && !member.roles.cache.some((role) => role.id === Config.LEVEL_ROLES[0])) {
        await member.roles.add(Config.LEVEL_ROLES[0]);
        return;
      }

      // If member is above level 5 and does not have role
      if (data.previousLevel === data.level && data.level >= 5) {
        const qualifiedRole = Config.LEVEL_ROLES[Math.floor(data.level / 5)];
        if (qualifiedRole && !member.roles.cache.some((role) => role.id === qualifiedRole)) {
          const existingRoles = member.roles.cache
            .filter((role) => Config.LEVEL_ROLES.includes(role.id));
          existingRoles.forEach((role) => member.roles.remove(role.id));
          await member.roles.add(qualifiedRole);
        }
        return;
      }
    }

    // New level is greater than previous level (level up)
    if (data.level > data.previousLevel) {
      // If member reached above Level 50 but does not have tag
      if (data.level >= 50 && Config.LEVEL_ROLES[10]
          && !member.roles.cache.some((role) => role.id === Config.LEVEL_ROLES[10])) {
        const existingRoles = member.roles.cache
          .filter((role) => Config.LEVEL_ROLES.includes(role.id));
        existingRoles.forEach((role) => member.roles.remove(role.id));
        await member.roles.add(Config.LEVEL_ROLES[10]);
        Inventory.give(member.id, 'Level Up Box', data.level - data.previousLevel);

        if (message) {
          await message.channel.send({ content: `${userMention(member.id)} is now **Level ${data.level}**! You have gained the **Level 50** tag.` });
        }
        return;
      }

      const qualifiedRole = Config.LEVEL_ROLES[Math.floor(data.level / 5)];
      // If member above level 5
      if (data.level >= 5) {
        // If does not have highest qualified role, give it
        if (qualifiedRole && !member.roles.cache.some((role) => role.id === qualifiedRole)) {
          const existingRoles = member.roles.cache
            .filter((role) => Config.LEVEL_ROLES.includes(role.id));
          existingRoles.forEach((role) => member.roles.remove(role.id));
          await member.roles.add(qualifiedRole);
          Inventory.give(member.id, 'Level Up Box', data.level - data.previousLevel);

          if (message) {
            await message.channel.send({ content: `${userMention(member.id)} is now **Level ${data.level}**! You have gained the **Level ${Math.floor(data.level / 5) * 5}** tag.` });
          }
          return;
        }
      }

      // If member leveled up but not at milestone
      Inventory.give(member.id, 'Level Up Box', 1);
      if (message) {
        await message.channel.send({ content: `${userMention(member.id)} is now **Level ${data.level}**!` });
      }
    }
  }

  private static formatLeaderboardPage(leaderboard: LeaderboardType, page: number) {
    const pageData = leaderboard.topRows.slice(page * 10, page * 10 + 10);
    let ranks = '';
    let names = '';
    let levels = '';
    pageData.forEach((row) => {
      ranks += `${row.exp_rank}\n`;
      names += `${userMention(row.user_id)}\n`;
      levels += `${row.level} (${row.currentExp}/${row.nextLevelExp})\n`;
    });

    return new EmbedBuilder()
      .setTitle('Leaderboard')
      .setTimestamp()
      .addFields([
        { name: 'Rank', value: ranks || 'None', inline: true },
        { name: 'Name', value: names || 'None', inline: true },
        { name: 'Level', value: levels || 'None', inline: true },
        { name: 'Your Rank', value: `${leaderboard.userRow.exp_rank}`, inline: true },
        { name: 'You', value: userMention(leaderboard.userRow.user_id), inline: true },
        {
          name: 'Your Level',
          value: `${leaderboard.userRow.level} (${leaderboard.userRow.currentExp}/${leaderboard.userRow.nextLevelExp})`,
          inline: true,
        },
      ]);
  }

  public static formatLeaderboard(leaderboard: LeaderboardType): Carousel {
    const page1 = this.formatLeaderboardPage(leaderboard, 0);
    const page2 = this.formatLeaderboardPage(leaderboard, 1);
    const page3 = this.formatLeaderboardPage(leaderboard, 2);
    const page4 = this.formatLeaderboardPage(leaderboard, 3);
    const page5 = this.formatLeaderboardPage(leaderboard, 4);
    const fallback = new EmbedBuilder().setTitle('No rankings').setDescription('There are no rankings available.');
    const pages = [page1, page2, page3, page4, page5];

    const prevBtn = new ButtonBuilder().setEmoji('◀️').setCustomId('prev').setStyle(ButtonStyle.Primary);
    const nextBtn = new ButtonBuilder().setEmoji('▶️').setCustomId('next').setStyle(ButtonStyle.Primary);
    const closeBtn = new ButtonBuilder().setLabel('Close').setCustomId('close').setStyle(ButtonStyle.Secondary);

    return new Carousel({
      pages,
      fallback,
      prev: { button: prevBtn, customId: 'prev' },
      next: { button: nextBtn, customId: 'next' },
      close: { button: closeBtn, customId: 'close' },
    });
  }
}
