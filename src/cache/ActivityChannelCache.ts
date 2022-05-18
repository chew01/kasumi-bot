import ActivityChannel from '../storage/ActivityChannel';

class ActivityChannelCache {
  private activityChannelIds: Set<string>;

  private activityUserIds: Set<string>;

  public constructor() {
    this.activityChannelIds = new Set<string>();
    this.activityUserIds = new Set<string>();
    const stored = ActivityChannel.get();
    if (stored) {
      stored.forEach((obj) => {
        this.activityChannelIds.add(obj.channel_id);
      });
    }
  }

  public getChannels() {
    return this.activityChannelIds;
  }

  public checkChannel(channel_id: string) {
    return this.activityChannelIds.has(channel_id);
  }

  public addChannel(channel_id: string) {
    const op = ActivityChannel.add(channel_id);
    if (op) {
      this.activityChannelIds.add(channel_id);
      return true;
    }
    return false;
  }

  public removeChannel(channel_id: string) {
    const op = ActivityChannel.remove(channel_id);
    if (op) {
      this.activityChannelIds.delete(channel_id);
      return true;
    }
    return false;
  }

  public checkUser(user_id: string) {
    return this.activityUserIds.has(user_id);
  }

  public addUser(user_id: string) {
    this.activityUserIds.add(user_id);
    setTimeout(() => {
      this.activityUserIds.delete(user_id);
    }, 300000);
  }
}

export default new ActivityChannelCache();
