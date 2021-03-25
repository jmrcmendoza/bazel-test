import { redisClient } from '@helpers/redis';
import jwt from 'jsonwebtoken';
import { Context } from 'koa';

const key = 'koacrud';

export async function createToken(id: string): Promise<string> {
  const token = jwt.sign({ id }, key);
  redisClient.set(`member:${id}`, token);
  redisClient.expire(`member:${id}`, 120);

  return token;
}

export async function verifyToken({ ctx }: { ctx: Context }): Promise<any> {
  const bearerHeader = ctx.request.header.authorization;

  let verified = false;
  let userId = '';

  if (!bearerHeader) {
    return { verified: true, isAdmin: true };
  }

  const token = bearerHeader.split(' ')[1];

  if (!token) {
    return { verified };
  }

  try {
    const result = jwt.verify(token, key);

    userId = result.id;

    const expire = await new Promise((resolve) =>
      redisClient.ttl(`member:${userId}`, (err, reply) => {
        resolve(reply);
      }),
    );

    if (expire === -2) verified = false;
    else {
      redisClient.expire(`member:${userId}`, 120);

      verified = !!result;
    }
  } catch (error) {
    verified = false;
  }

  return { verified, userId };
}
