import { RouterContext } from 'src/types/context';
import assert from 'assert';

import Model from 'src/model';

export default async function updatePersonController(
  context: RouterContext,
): Promise<Record<string, any>> {
  const {
    request: { body },
    state: { person },
  } = context;

  assert(person);

  const result: any = await Model.Person.findByIdAndUpdate(person.id, body);

  return {
    status: 200,
    body: result,
  };
}
