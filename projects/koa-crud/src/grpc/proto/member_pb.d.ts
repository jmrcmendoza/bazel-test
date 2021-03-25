// package: memberservice
// file: member.proto

/* tslint:disable */
/* eslint-disable */

import * as jspb from 'google-protobuf';

export class MembersRequest extends jspb.Message {
  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MembersRequest.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: MembersRequest,
  ): MembersRequest.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: MembersRequest,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): MembersRequest;
  static deserializeBinaryFromReader(
    message: MembersRequest,
    reader: jspb.BinaryReader,
  ): MembersRequest;
}

export namespace MembersRequest {
  export type AsObject = {};
}

export class MembersResponse extends jspb.Message {
  clearMembersList(): void;
  getMembersList(): Array<Member>;
  setMembersList(value: Array<Member>): MembersResponse;
  addMembers(value?: Member, index?: number): Member;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): MembersResponse.AsObject;
  static toObject(
    includeInstance: boolean,
    msg: MembersResponse,
  ): MembersResponse.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: MembersResponse,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): MembersResponse;
  static deserializeBinaryFromReader(
    message: MembersResponse,
    reader: jspb.BinaryReader,
  ): MembersResponse;
}

export namespace MembersResponse {
  export type AsObject = {
    membersList: Array<Member.AsObject>;
  };
}

export class Member extends jspb.Message {
  getId(): string;
  setId(value: string): Member;

  getUsername(): string;
  setUsername(value: string): Member;

  getPassword(): string;
  setPassword(value: string): Member;

  getRealname(): string;
  setRealname(value: string): Member;

  getEmail(): string;
  setEmail(value: string): Member;

  getBankaccount(): number;
  setBankaccount(value: number): Member;

  getCreatedat(): string;
  setCreatedat(value: string): Member;

  getUpdatedat(): string;
  setUpdatedat(value: string): Member;

  serializeBinary(): Uint8Array;
  toObject(includeInstance?: boolean): Member.AsObject;
  static toObject(includeInstance: boolean, msg: Member): Member.AsObject;
  static extensions: { [key: number]: jspb.ExtensionFieldInfo<jspb.Message> };
  static extensionsBinary: {
    [key: number]: jspb.ExtensionFieldBinaryInfo<jspb.Message>;
  };
  static serializeBinaryToWriter(
    message: Member,
    writer: jspb.BinaryWriter,
  ): void;
  static deserializeBinary(bytes: Uint8Array): Member;
  static deserializeBinaryFromReader(
    message: Member,
    reader: jspb.BinaryReader,
  ): Member;
}

export namespace Member {
  export type AsObject = {
    id: string;
    username: string;
    password: string;
    realname: string;
    email: string;
    bankaccount: number;
    createdat: string;
    updatedat: string;
  };
}
