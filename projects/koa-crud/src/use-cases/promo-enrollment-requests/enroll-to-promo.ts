import { find, includes, keys } from 'ramda';
import camelcase from 'camelcase';
import { PromoEnrollmentRequestDocument } from '@models/promo-enrollment-requests';
import { makePromoEnrollmentRequest } from '@entities/promo-enrollment-requests';
import { PromoEnrollmentRequestQueries } from '@dataAccess/promo-enrollment-requests/promo-enrollment-requests';
import { PromoQueries } from '@dataAccess/promos/promos';
import { PromoStatus, PromoTemplate } from '@models/promo';
import { MemberQueries } from '@dataAccess/members/members';

class PromoStatusError extends Error {
  constructor(message) {
    super(message);
    this.name = 'INVALID_PROMO_STATUS_ERROR';
  }
}

class MemberFieldError extends Error {
  constructor(message) {
    super(message);
    this.name = 'MEMBER_FIELD_MISSING';
  }
}

export default function makeEnrollToPromo({
  promoEnrollmentRequestsDB,
  promosDB,
  membersDB,
}: {
  promoEnrollmentRequestsDB: PromoEnrollmentRequestQueries;
  promosDB: PromoQueries;
  membersDB: MemberQueries;
}) {
  return async function enrollToPromo(
    enrollmentInfo: PromoEnrollmentRequestDocument,
  ): Promise<boolean> {
    await makePromoEnrollmentRequest(enrollmentInfo);

    const promoDetails = await promosDB.selectOnePromo(enrollmentInfo.promo);

    const memberDetails = await membersDB.selectOneMember(
      enrollmentInfo.member,
    );

    if (promoDetails.status !== PromoStatus.Active) {
      throw new PromoStatusError('Cannot enroll to Inactive/Draft promo.');
    }

    if (promoDetails.template === PromoTemplate.SignUp) {
      const memberField = find(
        (memberFields: any) =>
          !includes(camelcase(memberFields), keys(memberDetails)),
      )(promoDetails.requiredMemberFields);

      if (memberField) {
        throw new MemberFieldError(`${memberField} member field is missing.`);
      }
    }

    return promoEnrollmentRequestsDB.enrollToPromo(enrollmentInfo);
  };
}
