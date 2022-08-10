import {
  ChannelType, EmbedBuilder, roleMention, userMention,
} from 'discord.js';
import Giveaway from '../storage/models/Giveaway';
import { client } from '../ExtendedClient';
import Logger from '../services/Logger';

type MultiplierRole = {
  id: string,
  multi: number
};

type Ticket = {
  userId: string
};

class GiveawayManager {
  private readonly ongoing: Map<string, NodeJS.Timeout>;

  public constructor() {
    this.ongoing = new Map<string, NodeJS.Timeout>();
  }

  private static parseRoles(roleString: string): string[] {
    return roleString.split(' ').map((str) => str.replace(/<@&(\d*)>/, '$1'));
  }

  private static parseMultipliers(multiString: string): MultiplierRole[] {
    const arr = multiString.split('\n');
    return arr.map((multiplier) => {
      const tuple = multiplier.split(' - ');
      return { id: tuple[0]!.replace(/<@&(\d*)>/, '$1') || 'Error', multi: Number(tuple[1]) };
    });
  }

  private static timeoutFactory(
    messageId: string,
    channelId: string,
    draw: number,
    prize: string,
    host: string,
  ): NodeJS.Timeout | Promise<void> {
    const timeLeft = draw - Date.now();
    const timedFn = async () => {
      const tickets: Ticket[] = [];
      let userCount = 0;
      let ticketCount = 0;

      try {
        // Fetch channel
        const channel = await client.channels.fetch(channelId);
        if (channel && channel.type === ChannelType.GuildText) {
          // Fetch message
          const msg = await channel.messages.fetch(messageId);
          if (msg) {
            const embed = msg.embeds[0];
            if (!embed || !embed.fields) return;
            const requiredRoles = embed.fields[0]!.value === 'None' ? [] : GiveawayManager.parseRoles(embed.fields[0]!.value);
            const bypassRoles = embed.fields[1]!.value === 'None' ? [] : GiveawayManager.parseRoles(embed.fields[1]!.value);
            const multipliers = embed.fields[2]!.value === 'None' ? [] : GiveawayManager.parseMultipliers(embed.fields[2]!.value);

            // Fetch users that made party emoji
            const reactionData = msg.reactions.resolve('🎉');
            if (!reactionData) {
              await msg.edit({ content: 'This giveaway closed. There were no participants :(' });
              return;
            }
            const users = await reactionData.users.fetch();
            const proms = users.map(async (user) => {
              if (user.bot) return;
              const member = await channel.guild.members.fetch(user.id);
              if (!member) return;
              userCount += 1;

              // Filter out members without required roles, while not having bypass
              const hasRequired = member.roles.cache.some((r) => requiredRoles.includes(r.id));
              const hasBypass = member.roles.cache.some((r) => bypassRoles.includes(r.id));
              if (requiredRoles.length && bypassRoles.length && !hasRequired && !hasBypass) return;
              if (requiredRoles.length && !bypassRoles.length && !hasRequired) return;

              // For each guild member, create userid ticket and push into array x highest multi
              let multiplier = 1;
              multipliers.forEach((mr) => {
                if (member.roles.cache.has(mr.id) && mr.multi > multiplier) multiplier = mr.multi;
              });
              for (let i = 0; i < multiplier; i += 1) {
                tickets.push({ userId: user.id });
                ticketCount += 1;
              }
            });
            await Promise.all(proms);

            const winner = tickets[Math.floor(Math.random() * tickets.length)];
            const winEmbed = new EmbedBuilder()
              .setTitle('🎉 Giveaway Ended! 🎉')
              .setDescription(`CONGRATULATIONS!\nThe winner is ${userMention(winner!.userId)}!\n\nPrize: **${prize}**\nThis giveaway was hosted by ${userMention(host)}\nA total of __${userCount} users__ and __${ticketCount} entries__ were counted.`);

            await msg.reply({ content: `${userMention(winner!.userId)}`, embeds: [winEmbed] });
            await msg.delete();
          }
        }
        Giveaway.delete(messageId);
      } catch (err) {
        if (err instanceof Error) {
          Logger.error(err.stack || err.message);
        }
      }
    };

    if (timeLeft < 0) return timedFn();

    return setTimeout(async () => {
      await timedFn();
    }, timeLeft);
  }

  public start(
    messageId: string,
    channelId: string,
    draw: Date,
    prize: string,
    host: string,
  ): void {
    // Create db entry
    Giveaway.create(messageId, channelId, draw.getTime(), prize, host);
    // Create timeout
    const timeout = GiveawayManager.timeoutFactory(
      messageId,
      channelId,
      draw.getTime(),
      prize,
      host,
    );
    if (timeout instanceof Promise) return;
    this.ongoing.set(messageId, timeout);
  }

  public async stop(messageId: string): Promise<boolean> {
    const timeout = this.ongoing.get(messageId);
    if (!timeout) return false;
    clearTimeout(timeout);
    const data = Giveaway.getOne(messageId);
    if (!data) return false;
    Giveaway.delete(messageId);

    try {
      // Fetch channel
      const channel = await client.channels.fetch(data.channel_id);
      if (channel && channel.type === ChannelType.GuildText) {
        // Fetch message
        const msg = await channel.messages.fetch(messageId);
        if (msg) {
          await msg.delete();
          return true;
        }
        return false;
      }
    } catch (err) {
      if (err instanceof Error) {
        Logger.error(err.stack || err.message);
      }
    }
    return false;
  }

  public async addRole(
    messageId: string,
    field: number,
    role: string,
    multiplier?: number,
  ): Promise<boolean> {
    const data = Giveaway.getOne(messageId);
    const check = this.checkExists(messageId);
    if (!data || !check) return false;

    try {
      const channel = await client.channels.fetch(data.channel_id);
      if (channel && channel.type === ChannelType.GuildText) {
        // Fetch message
        const msg = await channel.messages.fetch(messageId);
        if (msg) {
          const embed = msg.embeds[0];
          if (!embed || !embed.fields) return false;

          let existingRequired = embed.fields[0]!.value;
          let existingBypass = embed.fields[1]!.value;
          let existingMultiplier = embed.fields[2]!.value;

          if (field === 0) {
            if (existingRequired === 'None') existingRequired = `${roleMention(role)}`;
            else {
              const parsed = GiveawayManager.parseRoles(existingRequired);
              if (parsed.includes(role)) return false;
              existingRequired += ` ${roleMention(role)}`;
            }
          }
          if (field === 1) {
            if (existingBypass === 'None') existingBypass = `${roleMention(role)}`;
            else {
              const parsed = GiveawayManager.parseRoles(existingBypass);
              if (parsed.includes(role)) return false;
              existingBypass += ` ${roleMention(role)}`;
            }
          }
          if (field === 2) {
            if (existingMultiplier === 'None') existingMultiplier = `${roleMention(role)} - ${multiplier}`;
            else {
              const parsed = GiveawayManager.parseMultipliers(existingMultiplier);
              if (parsed.some((multi) => multi.id === role)) return false;
              existingMultiplier += `\n${roleMention(role)} - ${multiplier}`;
            }
          }

          const updatedEmbed = new EmbedBuilder(embed.toJSON()).setFields([
            { name: 'Required Roles', value: existingRequired },
            { name: 'Bypass Roles', value: existingBypass },
            { name: 'Multiplier Roles', value: existingMultiplier },
          ]);

          await msg.edit({ embeds: [updatedEmbed] });
          return true;
        }
        return false;
      }
    } catch (err) {
      if (err instanceof Error) {
        Logger.error(err.stack || err.message);
      }
    }
    return false;
  }

  public checkExists(messageId: string) {
    return this.ongoing.has(messageId);
  }

  public restore() {
    const res = Giveaway.getAll();
    res.forEach((g) => {
      const timeout = GiveawayManager.timeoutFactory(
        g.message_id,
        g.channel_id,
        g.draw,
        g.prize,
        g.host,
      );
      if (timeout instanceof Promise) return;
      this.ongoing.set(g.message_id, timeout);
    });
  }
}

export default new GiveawayManager();
