/* eslint-disable consistent-return */
import { RouterContext } from 'src/types/context';
import Model from 'src/model';
import tryToCatch from 'try-to-catch';
import assert from 'assert';
import Koa from 'koa';
import { PersonNotFoundError } from './error/person-not-found';
import { ChannelNotFoundError } from './error/channel-not-found';
import { InvalidInputError } from './error/invalid-input';

export async function channelValidations(ctx: RouterContext, next: Koa.Next) {
  const [err, payload]: [Error | null, any] = await tryToCatch(async () => {
    const {
      params: { channelId },
      state: { person },
    } = ctx;

    assert(person);

    if (!channelId) {
      throw new InvalidInputError('Channel ID must be provided.');
    }

    const channel = await Model.Channel.findById(channelId);

    if (!channel || channel.archived) {
      throw new ChannelNotFoundError('Channel does not exist.');
    }

    if (!channel.persons.includes(person.id)) {
      throw new PersonNotFoundError('Person not a member of the channel.');
    }

    return channel;
  });

  if (err) {
    ctx.status = 401;
    ctx.body = { error: err.message };
    return ctx;
  }

  ctx.state.channel = payload;

  await next();
}
