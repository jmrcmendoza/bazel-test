import { RouterContext } from 'src/types/context';
import { IntegrationKeyNotFoundError } from 'src/library/error/integration-key-not-found';
import { InvalidInputError } from 'src/library/error/invalid-input';
import { InvalidIntegrationKeyError } from 'src/library/error/invalid-integration-key';
import R from 'ramda';
import rethinkdb from 'src/library/rethinkdb';
import { PersonNotFoundError } from 'src/library/error/person-not-found';
import { DuplicateIdError } from 'src/library/error/duplicate-id';

import PersonModel from 'src/model/rethinkdb/person';
import ChannelStatModel from 'src/model/rethinkdb/channel-stat';
import Model from 'src/model';

export default async function initiateChannelController(
  context: RouterContext,
): Promise<Record<string, any>> {
  const integration = context.get('Integration-Key');
  const {
    request: {
      body: { id, persons },
    },
  } = context;

  if (!integration) {
    throw new InvalidIntegrationKeyError('Integration Key must be provided.');
  }
  const keyExists = await Model.Integration.findOne({
    key: integration,
  });

  if (!keyExists) {
    throw new IntegrationKeyNotFoundError('Integration Key does not exist.');
  }

  if (!id) {
    throw new InvalidInputError('Channel Id must be provided.');
  }

  const channelExist = await Model.Channel.findById(id);

  if (channelExist) {
    throw new DuplicateIdError('Channel already exist.');
  }

  if (!persons) {
    throw new InvalidInputError('Persons must be provided.');
  }

  if (persons.length < 2) {
    throw new InvalidInputError('There should be two or more persons.');
  }

  const personCursor = await (Model.Person as typeof PersonModel).table
    .getAll(...persons)
    .filter({ integration, archived: false })
    .run(rethinkdb.connection);

  const allPersons = R.map((person: any) => person.id)(
    await personCursor.toArray(),
  );

  const nonPresentIds = R.difference(persons)(allPersons || []);

  if (nonPresentIds.length) {
    throw new PersonNotFoundError(
      `Person IDs does not exist: ${nonPresentIds}`,
    );
  }

  const result: any = await Model.Channel.create({
    id,
    persons,
    integration,
  });

  await ChannelStatModel.createChannelStat(id, persons);

  return {
    status: 201,
    body: !!result,
  };
}
