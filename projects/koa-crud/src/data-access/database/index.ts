/* eslint-disable import/no-extraneous-dependencies */
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

const mongod = new MongoMemoryServer();

export const initializeDatabase = async (): Promise<void> => {
  const uri =
    process.env.NODE_ENV === 'test'
      ? await mongod.getUri()
      : 'mongodb://localhost:27017';

  const mongooseOpts = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: true,
  };

  await mongoose.connect(uri, mongooseOpts);

  mongoose.set('runValidators', true);
};
