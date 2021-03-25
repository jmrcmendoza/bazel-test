// package: memberservice
// file: member.proto

/* tslint:disable */
/* eslint-disable */

import * as grpc from 'grpc';
import * as member_pb from './member_pb';

interface IMemberServiceService
  extends grpc.ServiceDefinition<grpc.UntypedServiceImplementation> {
  getMembers: IMemberServiceService_IGetMembers;
}

interface IMemberServiceService_IGetMembers
  extends grpc.MethodDefinition<
    member_pb.MembersRequest,
    member_pb.MembersResponse
  > {
  path: '/memberservice.MemberService/GetMembers';
  requestStream: false;
  responseStream: false;
  requestSerialize: grpc.serialize<member_pb.MembersRequest>;
  requestDeserialize: grpc.deserialize<member_pb.MembersRequest>;
  responseSerialize: grpc.serialize<member_pb.MembersResponse>;
  responseDeserialize: grpc.deserialize<member_pb.MembersResponse>;
}

export const MemberServiceService: IMemberServiceService;

export interface IMemberServiceServer {
  getMembers: grpc.handleUnaryCall<
    member_pb.MembersRequest,
    member_pb.MembersResponse
  >;
}

export interface IMemberServiceClient {
  getMembers(
    request: member_pb.MembersRequest,
    callback: (
      error: grpc.ServiceError | null,
      response: member_pb.MembersResponse,
    ) => void,
  ): grpc.ClientUnaryCall;
  getMembers(
    request: member_pb.MembersRequest,
    metadata: grpc.Metadata,
    callback: (
      error: grpc.ServiceError | null,
      response: member_pb.MembersResponse,
    ) => void,
  ): grpc.ClientUnaryCall;
  getMembers(
    request: member_pb.MembersRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (
      error: grpc.ServiceError | null,
      response: member_pb.MembersResponse,
    ) => void,
  ): grpc.ClientUnaryCall;
}

export class MemberServiceClient
  extends grpc.Client
  implements IMemberServiceClient {
  constructor(
    address: string,
    credentials: grpc.ChannelCredentials,
    options?: object,
  );
  public getMembers(
    request: member_pb.MembersRequest,
    callback: (
      error: grpc.ServiceError | null,
      response: member_pb.MembersResponse,
    ) => void,
  ): grpc.ClientUnaryCall;
  public getMembers(
    request: member_pb.MembersRequest,
    metadata: grpc.Metadata,
    callback: (
      error: grpc.ServiceError | null,
      response: member_pb.MembersResponse,
    ) => void,
  ): grpc.ClientUnaryCall;
  public getMembers(
    request: member_pb.MembersRequest,
    metadata: grpc.Metadata,
    options: Partial<grpc.CallOptions>,
    callback: (
      error: grpc.ServiceError | null,
      response: member_pb.MembersResponse,
    ) => void,
  ): grpc.ClientUnaryCall;
}
