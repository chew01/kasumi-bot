import Member from '../storage/models/Member';

class MemberCache {
  private members: Set<string>;

  constructor() {
    this.members = new Set<string>();
    const stored = Member.getMemberIds();
    if (stored) stored.forEach((id) => this.members.add(id));
  }

  public initialiseIfNotExists(user_id: string): void {
    if (!this.members.has(user_id)) {
      Member.initialise(user_id);
      this.members.add(user_id);
    }
  }
}

export default new MemberCache();
