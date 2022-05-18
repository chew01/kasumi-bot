import Member from '../storage/Member';

class MemberCache {
  private members: Set<string>;

  constructor() {
    this.members = new Set<string>();
    const stored = Member.getMembers();
    if (stored) {
      stored.forEach((obj) => {
        this.members.add(obj.user_id);
      });
    }
  }

  public initialiseIfNotExists(user_id: string) {
    const check = this.members.has(user_id);
    if (!check) {
      const op = Member.initialise(user_id);
      if (!op) return false;
      this.members.add(user_id);
    }
    return true;
  }
}

export default new MemberCache();
