/* eslint-disable no-shadow */
import { Schema, model, Document } from 'mongoose';
import mongooseLeanVirtuals from 'mongoose-lean-virtuals';

export enum VendorType {
  Seamless = 'SEAMLESS',
  Transfer = 'TRANSFER',
}

export type VendorDocument = Document & {
  name: string;
  type: VendorType;
};

export default model<VendorDocument>(
  'Vendor',
  new Schema(
    {
      name: {
        type: String,
        required: true,
      },
      type: {
        type: String,
        enum: [VendorType.Seamless, VendorType.Transfer],
        required: true,
      },
    },
    { timestamps: true },
  ).plugin(mongooseLeanVirtuals),
);
