/* eslint-disable class-methods-use-this */
import grpc from 'grpc';
import MemberModel from '@models/member';
import { initializeDatabase } from '@dataAccess/database';
import {
  IMemberServiceServer,
  MemberServiceService,
} from './proto/member_grpc_pb';
import { Member, MembersRequest, MembersResponse } from './proto/member_pb';

initializeDatabase();

class MemberService implements IMemberServiceServer {
  public async getMembers(
    _call: grpc.ServerUnaryCall<MembersRequest>,
    callback: grpc.sendUnaryData<MembersResponse>,
  ): Promise<void> {
    const members = await MemberModel.find({});
    const response = new MembersResponse();
    const membersObj: Member[] = members.map((h) => {
      const c = new Member();
      if (h !== undefined) {
        c.setId(h.id);
        c.setUsername(h.username);
        c.setPassword(h.password);
        c.setRealname(h.realname);
        c.setEmail(h.email);
        c.setBankaccount(h.bankaccount);
        c.setCreatedat(h.createdat);
        c.setUpdatedat(h.updatedat);
      }
      return c;
    });
    response.setMembersList(membersObj);
    callback(null, response);
  }
}

const server = new grpc.Server();

server.addService<IMemberServiceServer>(
  MemberServiceService,
  new MemberService(),
);
server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
server.start();
