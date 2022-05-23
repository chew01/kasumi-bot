import type { GuildMember } from 'discord.js';
import Config from '../Config';
import MathUtils from '../utils/MathUtils';
import Level from '../modules/Level';
import Member from '../storage/models/Member';

class VoiceParticipationCache {
  private readonly voiceParticipationUsers: Map<string, GuildMember>;

  constructor() {
    this.voiceParticipationUsers = new Map<string, GuildMember>();

    setInterval(async () => {
      await this.reward();
    }, Config.VOICE_REWARD_COOLDOWN);
  }

  public join(user_id: string, member: GuildMember): void {
    if (!this.voiceParticipationUsers.has(user_id)) {
      this.voiceParticipationUsers.set(user_id, member);
    }
  }

  public leave(user_id: string): void {
    if (this.voiceParticipationUsers.has(user_id)) {
      this.voiceParticipationUsers.delete(user_id);
    }
  }

  private async reward(): Promise<void> {
    let exp: number;

    Array.from(this.voiceParticipationUsers.entries())
      .map((user) => {
        if (!user[1].premiumSinceTimestamp) {
          exp = MathUtils.randomInRange(
            Config.VOICE_EXP_BASE_MIN,
            Config.VOICE_EXP_BASE_MAX,
          );
        }
        if (user[1].premiumSinceTimestamp) {
          exp = MathUtils.randomInRange(
            Config.VOICE_EXP_NITRO_MIN,
            Config.VOICE_EXP_NITRO_MAX,
          );
        }

        const level = Member.addExperience(user[0], exp);
        return Level.check(level, user[1]);
      });
  }
}

export default new VoiceParticipationCache();
