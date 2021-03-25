import redis from 'redis';

export const redisClient = redis.createClient();

redisClient.on('error', function (error) {
  console.error(error);
});
