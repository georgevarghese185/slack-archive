import { Member } from './member';
import { getMember } from './member-api';

export class MemberStore {
  private cache: Record<string, Member> = {};
  private fetching: Record<string, true> = {};
  private events = new EventTarget();

  async get(id: string): Promise<Member> {
    return this.fromCache(id) || this.fromRemote(id);
  }

  fromCache(id: string): Member | null {
    return this.cache[id] || null;
  }

  private async fromRemote(id: string): Promise<Member> {
    if (this.isBeingFetched(id)) {
      await this.waitUntilFetched(id);
      return this.get(id);
    }

    const member = await this.fetchMember(id);
    this.cacheMember(member);
    this.notifyMemberFetched(id);

    return member;
  }

  private isBeingFetched(id: string): boolean {
    return this.fetching[id] || false;
  }

  private async waitUntilFetched(id: string) {
    await new Promise(resolve =>
      this.events.addEventListener(`memberFetch:${id}`, resolve)
    );
  }

  private async notifyMemberFetched(id: string) {
    this.events.dispatchEvent(new Event(`memberFetch:${id}`));
  }

  private async fetchMember(id: string): Promise<Member> {
    this.fetching[id] = true;
    const member = await getMember({ id });
    delete this.fetching[id];
    return member;
  }

  private async cacheMember(member: Member) {
    this.cache[member.id] = member;
  }
}
