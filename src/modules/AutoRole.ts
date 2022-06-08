import type { GuildMember } from 'discord.js';
import Config from '../Config';

export default class AutoRole {
  public static async assign(member: GuildMember) {
    const autoroles = Config.getAutoRoles();
    const proms = autoroles.map(async (roleId) => {
      await member.roles.add(roleId);
    });
    await Promise.all(proms);
  }
}
