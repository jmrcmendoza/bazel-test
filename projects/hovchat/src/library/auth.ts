import { jwt } from 'highoutput-auth';
import ms from 'ms';

import { ID } from 'src/types/common';

const SECRET_KEY = process.env.SECRET_KEY || 'n=P*xa+cBUvejX8%Z~RkGL<YMV-#uHK6';

export function create(payload: { integrationKey: string; person: ID }) {
  return jwt.create(payload, SECRET_KEY, {
    expiresIn: ms('30d'),
    subject: payload.person,
  });
}

export function verify(token: string) {
  return jwt.verify(token, SECRET_KEY);
}
