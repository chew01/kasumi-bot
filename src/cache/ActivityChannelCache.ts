import ActivityChannel from '../storage/models/ActivityChannel';
import Config from '../Config';

class ActivityChannelCache {
  private readonly activityChannelIds: Set<string>;

  private activityUserIds: Set<string>;

  public constructor() {
    this.activityChannelIds = new Set<string>();
    this.activityUserIds = new Set<string>();
    const stored = ActivityChannel.getChannelIds();
    if (stored) stored.forEach((id) => this.activityChannelIds.add(id));
  }

  public getChannelIds(): Set<string> {
    return this.activityChannelIds;
  }

  public checkChannel(channel_id: string): boolean {
    return this.activityChannelIds.has(channel_id);
  }

  public addChannel(channel_id: string): void {
    ActivityChannel.add(channel_id);
    this.activityChannelIds.add(channel_id);
  }

  public removeChannel(channel_id: string): void {
    ActivityChannel.remove(channel_id);
    this.activityChannelIds.delete(channel_id);
  }

  public checkUser(user_id: string): boolean {
    return this.activityUserIds.has(user_id);
  }

  public addUser(user_id: string) {
    this.activityUserIds.add(user_id);
    setTimeout(() => {
      this.activityUserIds.delete(user_id);
    }, Config.MESSAGE_REWARD_COOLDOWN);
  }
}

export default new ActivityChannelCache();
