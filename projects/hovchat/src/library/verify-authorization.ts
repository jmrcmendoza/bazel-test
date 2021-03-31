/* eslint-disable consistent-return */
import { RouterContext } from 'src/types/context';
import tryToCatch from 'try-to-catch';
import Koa from 'koa';
import IntegrationModel from 'src/model/rethinkdb/integration';
import PersonModel from 'src/model/rethinkdb/person';
import { verify } from './auth';
import { AuthorizationError } from './error/invalid-authorization';
import { IntegrationKeyNotFoundError } from './error/integration-key-not-found';
import { PersonNotFoundError } from './error/person-not-found';

export async function verifyAuthorization(ctx: RouterContext, next: Koa.Next) {
  const [err, payload]: [Error | null, any] = await tryToCatch(async () => {
    const authorization = ctx.get('Authorization');
    if (!authorization) {
      throw new AuthorizationError('Authorization must be provided.');
    }

    const token = authorization.split(' ')[1];
    if (!token) {
      throw new AuthorizationError('Invalid authorization key.');
    }

    const [invalidToken, data]: [Error | null, any] = await tryToCatch(() =>
      verify(token),
    );

    if (invalidToken) {
      throw new AuthorizationError('Invalid authorization key.');
    }

    const integration = await IntegrationModel.findByKey(data.integrationKey);

    if (!integration) {
      throw new IntegrationKeyNotFoundError('Integration Key does not exist.');
    }

    const person = await PersonModel.findPerson(
      data.person,
      data.integrationKey,
    );

    if (!person) {
      throw new PersonNotFoundError('Person does not exist.');
    }

    return { person, integration };
  });

  if (err) {
    ctx.status = 401;
    ctx.body = { error: err.message };
    return ctx;
  }

  ctx.state.person = payload.person;
  ctx.state.integration = payload.integration;

  await next();
}
