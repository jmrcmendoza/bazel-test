import { Context } from 'koa';
import { MemberDocument } from '@models/member';

import {
  insertMember,
  listMembers,
  selectMember,
  updateMember,
  deleteMember,
} from '@useCases/members';

import { VendorDocument } from '@models/vendor';

import {
  insertVendor,
  listVendors,
  selectVendor,
  updateVendor,
  deleteVendor,
} from '@useCases/vendors';

import { authenticateMember } from '@useCases/authenticate';
import { PromoDocument } from '@models/promo';
import {
  deletePromo,
  insertPromo,
  listPromos,
  selectPromo,
  updatePromo,
} from '@useCases/promos';
import {
  approvePromoEnrollmentRequest,
  enrollToPromo,
  listPromoEnrollmentRequests,
  processPromoEnrollmentRequest,
  rejectPromoEnrollmentRequest,
  selectOnePromoEnrollmentRequest,
} from '@useCases/promo-enrollment-requests';

class AuthorizationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'AUTHORIZATION_ERROR';
  }
}

export default {
  Query: {
    vendors: async (
      _obj,
      { limit, after, filter },
      ctx: Context,
    ): Promise<any> => {
      if (!ctx.verified) {
        throw new AuthorizationError('Forbidden');
      }

      return listVendors(limit, after, filter);
    },
    vendor: async (
      _obj,
      vendor: { id: string },
      ctx: Context,
    ): Promise<Record<string, any>> => {
      if (!ctx.verified) {
        throw new AuthorizationError('Forbidden');
      }

      return selectVendor(vendor.id);
    },
    members: async (
      _obj,
      { limit, after, filter },
      ctx: Context,
    ): Promise<any> => {
      if (!ctx.verified) {
        throw new AuthorizationError('Forbidden');
      }

      return listMembers(limit, after, filter);
    },
    member: async (
      _obj,
      args: { id: string },
      ctx: Context,
    ): Promise<Record<string, any>> => {
      if (!ctx.verified) {
        throw new AuthorizationError('Forbidden');
      }

      return selectMember(args.id);
    },
    promos: async (
      _obj,
      { limit, after, filter },
      ctx: Context,
    ): Promise<any> => {
      if (!ctx.verified) {
        throw new AuthorizationError('Forbidden');
      }

      return listPromos(limit, after, filter);
    },
    promo: async (
      _obj,
      args: { id: string },
      ctx: Context,
    ): Promise<Record<string, any>> => {
      if (!ctx.verified) {
        throw new AuthorizationError('Forbidden');
      }

      return selectPromo(args.id);
    },
    promoEnrollmentRequests: async (
      _obj,
      { limit, after, filter },
      ctx: Context,
    ): Promise<any> => {
      if (!ctx.verified) {
        throw new AuthorizationError('Forbidden');
      }

      return listPromoEnrollmentRequests(limit, after, filter);
    },
    promoEnrollmentRequest: async (
      _obj,
      args: { id: string },
      ctx: Context,
    ): Promise<Record<string, any>> => {
      if (!ctx.verified) {
        throw new AuthorizationError('Forbidden');
      }

      return selectOnePromoEnrollmentRequest(args.id);
    },
  },

  Member: {
    password(): string {
      return '';
    },
  },

  Vendor: {
    type(obj: { type: string }): string {
      if (obj.type === 'SEAMLESS') return 'SEAMLESS';
      if (obj.type === 'TRANSFER') return 'TRANSFER';
      return 'SEAMLESS';
    },
    // name: (obj) => `Vendor - ${obj.name}`,
  },

  Promo: {
    __resolveType(obj: { template: string }): string {
      if (obj.template === 'SIGN_UP') return 'SignUpPromo';
      return 'DepositPromo';
    },
  },

  PromoEnrollmentRequest: {
    async promo(obj: { promo: string }): Promise<PromoDocument> {
      return selectPromo(obj.promo);
    },

    async member(obj: { member: string }): Promise<PromoDocument> {
      return selectMember(obj.member);
    },
  },

  Mutation: {
    createMember: async (
      _obj,
      args: {
        input: MemberDocument;
      },
      ctx: Context,
    ): Promise<boolean> => {
      if (!ctx.verified) {
        throw new AuthorizationError('Forbidden');
      }

      return insertMember(args.input);
    },
    updateMember: async (
      _obj,
      args: {
        id: string;
        input: MemberDocument;
      },
      ctx: Context,
    ): Promise<boolean> => {
      if (!ctx.verified) {
        throw new AuthorizationError('Forbidden');
      }

      return updateMember(args.id, args.input);
    },

    deleteMember: async (
      _obj,
      args: { id: string },
      ctx: Context,
    ): Promise<boolean> => {
      if (!ctx.verified) {
        throw new AuthorizationError('Forbidden');
      }

      return deleteMember(args.id);
    },

    authenticate: async (
      _obj,
      args: { input: MemberDocument },
    ): Promise<{ token: string }> => {
      return authenticateMember(args.input);
    },

    createVendor: async (
      _obj,
      args: {
        input: VendorDocument;
      },
      ctx: Context,
    ): Promise<Record<string, any>> => {
      if (!ctx.verified) {
        throw new AuthorizationError('Forbidden');
      }

      return insertVendor(args.input);
    },
    updateVendor: async (
      _obj,
      args: {
        id: string;
        input: VendorDocument;
      },
      ctx: Context,
    ): Promise<boolean> => {
      if (!ctx.verified) {
        throw new AuthorizationError('Forbidden');
      }

      return updateVendor(args.id, args.input);
    },

    deleteVendor: async (
      _obj,
      args: { id: string },
      ctx: Context,
    ): Promise<boolean> => {
      if (!ctx.verified) {
        throw new AuthorizationError('Forbidden');
      }

      return deleteVendor(args.id);
    },

    createPromo: async (
      _obj,
      args: {
        input: PromoDocument;
      },
      ctx: Context,
    ): Promise<boolean> => {
      if (!ctx.isAdmin) {
        throw new AuthorizationError('Forbidden');
      }

      return insertPromo(args.input);
    },

    updatePromo: async (
      _obj,
      args: {
        id: string;
        input: PromoDocument;
      },
      ctx: Context,
    ): Promise<boolean> => {
      if (!ctx.isAdmin) {
        throw new AuthorizationError('Forbidden');
      }

      return updatePromo(args.id, args.input);
    },

    deletePromo: async (
      _obj,
      args: { id: string },
      ctx: Context,
    ): Promise<boolean> => {
      if (!ctx.isAdmin) {
        throw new AuthorizationError('Forbidden');
      }

      return deletePromo(args.id);
    },

    enrollToPromo: async (
      _obj,
      args: { promo: string },
      ctx: Context,
    ): Promise<boolean> => {
      if (!ctx.verified) {
        throw new AuthorizationError('Forbidden');
      }

      const data: any = {
        promo: args.promo,
        member: ctx.userId,
      };

      return enrollToPromo(data);
    },

    processPromoEnrollmentRequest: async (
      _obj,
      args: { id: string },
      ctx: Context,
    ): Promise<boolean> => {
      if (!ctx.isAdmin) {
        throw new AuthorizationError('Forbidden');
      }

      return processPromoEnrollmentRequest(args.id);
    },

    approvePromoEnrollmentRequest: async (
      _obj,
      args: { id: string },
      ctx: Context,
    ): Promise<boolean> => {
      if (!ctx.isAdmin) {
        throw new AuthorizationError('Forbidden');
      }

      return approvePromoEnrollmentRequest(args.id);
    },

    rejectPromoEnrollmentRequest: async (
      _obj,
      args: { id: string },
      ctx: Context,
    ): Promise<boolean> => {
      if (!ctx.isAdmin) {
        throw new AuthorizationError('Forbidden');
      }

      return rejectPromoEnrollmentRequest(args.id);
    },
  },
};
