import {
  MemberFields,
  PromoDocument,
  PromoStatus,
  PromoTemplate,
} from '@models/promo';

export class PromoValidationError extends Error {
  constructor(message) {
    super(message);
    this.name = 'PROMO_VALIDATION_ERROR';
  }
}

class InvalidPromoTemplate extends Error {
  constructor(message) {
    super(message);
    this.name = 'INVALID_PROMO_TYPE';
  }
}

class InvalidPromoStatus extends Error {
  constructor(message) {
    super(message);
    this.name = 'INVALID_PROMO_STATUS';
  }
}

class InvalidMemberFeild extends Error {
  constructor(message) {
    super(message);
    this.name = 'INVALID_MEMBER_FIELD';
  }
}

export default function () {
  return async function makeVendor(
    promo: PromoDocument,
  ): Promise<void | Error> {
    const {
      name,
      template,
      title,
      description,
      status,
      minimumBalance,
      requiredMemberFields,
    } = promo;

    if (!name) {
      throw new PromoValidationError('Promo name must be provided.');
    }
    if (!template) {
      throw new PromoValidationError('Template must be provided.');
    }
    if (!Object.values(PromoTemplate).includes(template)) {
      throw new InvalidPromoTemplate('Invalid template.');
    }
    if (!title) {
      throw new PromoValidationError('Promo title must be provided');
    }
    if (!description) {
      throw new PromoValidationError('Description must be provided.');
    }
    if (status && !Object.values(PromoStatus).includes(status)) {
      throw new InvalidPromoStatus('Invalid status.');
    }

    if (template === PromoTemplate.Deposit && !minimumBalance) {
      throw new PromoValidationError('Minimum balance must be provided.');
    }
    if (template === PromoTemplate.SignUp) {
      if (!requiredMemberFields || requiredMemberFields.length < 1) {
        throw new PromoValidationError('Members fields must be provided.');
      }

      const invalidField = requiredMemberFields.find(
        (field) => !Object.values(MemberFields).includes(field),
      );

      if (invalidField) {
        throw new InvalidMemberFeild(`${invalidField} is an invalid field.`);
      }
    }
  };
}
