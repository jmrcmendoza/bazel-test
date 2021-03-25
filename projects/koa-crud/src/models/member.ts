/* eslint-disable no-shadow */
import { Schema, model, Document } from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';

export type MemberDocument = Document & {
  username: string;
  password: string;
  realName: string | null;
  email: string | null;
  bankAccount: number | null;
};

export default model<MemberDocument>(
  'Member',
  new Schema(
    {
      username: {
        type: String,
        required: true,
        unique: true,
      },
      password: {
        type: String,
        required: true,
      },
      realName: {
        type: String,
      },
      email: {
        type: String,
      },
      bankAccount: {
        type: Number,
      },
    },
    { timestamps: true },
  ).plugin(mongooseLeanVirtuals),
);
