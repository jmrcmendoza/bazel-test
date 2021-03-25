/* eslint-disable no-shadow */
import { Schema, model, Document } from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';

export enum PromoTemplate {
  Deposit = 'DEPOSIT',
  SignUp = 'SIGN_UP',
}

export enum PromoStatus {
  Draft = 'DRAFT',
  Active = 'ACTIVE',
  Inactve = 'INACTIVE',
}

export enum MemberFields {
  EMAIL,
  REAL_NAME,
  BANK_ACCOUNT,
}

export type PromoDocument = Document & {
  name: string;
  template: PromoTemplate;
  title: string;
  description: string;
  submitted: boolean;
  enabled: boolean;
  status: PromoStatus;
  minimumBalance: number | null;
  requiredMemberFields: MemberFields[];
};

export default model<PromoDocument>(
  'Promo',
  new Schema(
    {
      name: {
        type: String,
        required: true,
      },
      template: {
        type: String,
        enum: [PromoTemplate.Deposit, PromoTemplate.SignUp],
        required: true,
      },
      title: {
        type: String,
        required: true,
      },
      description: {
        type: String,
        required: true,
      },
      submitted: {
        type: Boolean,
      },
      enabled: {
        type: Boolean,
      },
      status: {
        type: String,
        enum: [PromoStatus.Draft, PromoStatus.Active, PromoStatus.Inactve],
        default: PromoStatus.Draft,
        required: true,
      },
      minimumBalance: {
        type: Number,
      },
      requiredMemberFields: {
        type: [String],
      },
    },
    { timestamps: true },
  ).plugin(mongooseLeanVirtuals),
);
