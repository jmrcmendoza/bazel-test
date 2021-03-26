import { RouterContext } from 'src/types/context';
import { InvalidInputError } from 'src/library/error/invalid-input';
import assert from 'assert';
import R from 'ramda';
import { PersonNotFoundError } from 'src/library/error/person-not-found';

import Model from 'src/model';
import ChannelStatModel from 'src/model/rethinkdb/channel-stat';
import ContactModel from 'src/model/rethinkdb/contact';
import PersonModel from 'src/model/rethinkdb/person';

export default async function postDirectMessageController(
  context: RouterContext,
): Promise<Record<string, any>> {
  const {
    request: {
      body: { body, attachments },
    },
    params: { recipient },
    state: { person, integration },
  } = context;

  assert(person);
  assert(integration);

  if (!recipient) {
    throw new InvalidInputError('Recipient must be provided.');
  }

  const recipientExist = await PersonModel.findPerson(
    recipient,
    integration.key,
  );

  if (!recipientExist) {
    throw new PersonNotFoundError('Recipient does not exist.');
  }

  if (!body) {
    throw new InvalidInputError('Message must be provided.');
  }

  const channel = R.reduce(
    (acc: string, value: string) => {
      if (acc) {
        return `${acc}:${value}`;
      }
      return value;
    },
    '',
    R.sortBy(R.identity)([person.id, recipient]),
  ) as any;

  const channelStatExist = await Model.ChannelStat.findOne({ channel });

  if (!channelStatExist) {
    await ChannelStatModel.createChannelStat(channel, [person.id, recipient]);
  }

  if (integration.contacts) {
    const contact = await Model.Contact.findOne({ person: person.id });

    if (contact && !contact.contacts.includes(recipient)) {
      await ContactModel.addContact(person.id, integration.key, recipient);
    }
  }

  const result: any = await Model.Message.create({
    body,
    sender: person.id,
    integration: integration.key,
    channel,
    attachments: attachments || [],
  });

  await ChannelStatModel.incrementUnreadCount(channel, person.id);

  return {
    status: 201,
    body: !!result,
  };
}
