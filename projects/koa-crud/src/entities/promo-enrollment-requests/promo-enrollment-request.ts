import { PromoEnrollmentRequestDocument } from '@models/promo-enrollment-requests';

export class PromoEnrollmentRequestValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PROMO_ENROLLMENT_REQUEST_VALIDATION_ERROR';
  }
}

export default function () {
  return async function makeVendor(
    promoEnrollmentRequest: PromoEnrollmentRequestDocument,
  ): Promise<void | Error> {
    const { member, promo } = promoEnrollmentRequest;

    if (!promo) {
      throw new PromoEnrollmentRequestValidationError(
        'Promo must be provided.',
      );
    }

    if (!member) {
      throw new PromoEnrollmentRequestValidationError(
        'Member must be provided.',
      );
    }
  };
}
