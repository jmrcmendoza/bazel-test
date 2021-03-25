/* eslint-disable no-param-reassign */
import MemberModel, { MemberDocument } from '@models/member';
import { compareHash, createHash } from '@encryption';
import { paginate, Connection } from '@helpers/pagination';
import { _FilterQuery } from 'mongoose';

export type MemberQueries = {
  listMembers: (
    limit: number | null,
    cursor: string | null,
    filter: string | null,
  ) => Promise<Connection<Record<string, any>>>;
  selectOneMember: (id: string) => Promise<MemberDocument>;
  createMember: (document: MemberDocument) => Promise<boolean>;
  updateMember: (id: string, document: MemberDocument) => Promise<boolean>;
  deleteMember: (id: string) => Promise<boolean>;
  authenticateMember: (
    document: MemberDocument,
  ) => Promise<{ verified: boolean; id: string }>;
};

export default function ({
  member,
}: {
  member: typeof MemberModel;
}): MemberQueries {
  return Object.freeze({
    listMembers(
      limit: number | null,
      cursor: string | null,
      filter: string | null,
    ) {
      return paginate(member, limit, cursor, { password: 0 }, filter);
    },
    async selectOneMember(id: string) {
      const result = await member
        .findById(id, { password: 0 })
        .lean({ virtuals: true });

      return result;
    },
    async createMember(memberInfo: MemberDocument) {
      if (memberInfo.password) {
        const hash = await createHash(memberInfo.password);

        memberInfo.password = hash;
      }

      const result = await member.create(memberInfo);

      return !!result;
    },
    async updateMember(id: string, memberInfo: MemberDocument) {
      if (memberInfo.password) {
        const hash = await createHash(memberInfo.password);

        memberInfo.password = hash;
      }

      const result = await member.findByIdAndUpdate(id, memberInfo, {
        useFindAndModify: false,
      });

      return !!result;
    },
    async deleteMember(id: string) {
      const result = await member.findByIdAndDelete(id);

      return !!result;
    },
    async authenticateMember(memberInfo: MemberDocument) {
      const memberDetails = await member
        .findOne({ username: memberInfo.username })
        .lean({ virtuals: true });

      const result = await compareHash(
        memberInfo.password,
        memberDetails.password,
      );
      return {
        verified: result,
        id: memberDetails.id,
      };
    },
  });
}
