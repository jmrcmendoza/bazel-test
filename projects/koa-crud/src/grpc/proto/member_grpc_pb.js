// GENERATED CODE -- DO NOT EDIT!

'use strict';
var grpc = require('grpc');
var member_pb = require('./member_pb.js');

function serialize_memberservice_MembersRequest(arg) {
  if (!(arg instanceof member_pb.MembersRequest)) {
    throw new Error('Expected argument of type memberservice.MembersRequest');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_memberservice_MembersRequest(buffer_arg) {
  return member_pb.MembersRequest.deserializeBinary(new Uint8Array(buffer_arg));
}

function serialize_memberservice_MembersResponse(arg) {
  if (!(arg instanceof member_pb.MembersResponse)) {
    throw new Error('Expected argument of type memberservice.MembersResponse');
  }
  return Buffer.from(arg.serializeBinary());
}

function deserialize_memberservice_MembersResponse(buffer_arg) {
  return member_pb.MembersResponse.deserializeBinary(new Uint8Array(buffer_arg));
}


var MemberServiceService = exports.MemberServiceService = {
  getMembers: {
    path: '/memberservice.MemberService/GetMembers',
    requestStream: false,
    responseStream: false,
    requestType: member_pb.MembersRequest,
    responseType: member_pb.MembersResponse,
    requestSerialize: serialize_memberservice_MembersRequest,
    requestDeserialize: deserialize_memberservice_MembersRequest,
    responseSerialize: serialize_memberservice_MembersResponse,
    responseDeserialize: deserialize_memberservice_MembersResponse,
  },
};

exports.MemberServiceClient = grpc.makeGenericClientConstructor(MemberServiceService);
