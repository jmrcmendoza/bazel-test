/* eslint-disable import/no-extraneous-dependencies */
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';

export default class DBManager {
  db: any;

  server: any;

  connection: any;

  constructor() {
    this.server = new MongoMemoryServer();
  }

  async start() {
    const url = await this.server.getUri();

    if (!mongoose.connection) {
      this.connection = await mongoose.connect(url, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: true,
      });
    }
  }

  async stop() {
    await mongoose.disconnect();
    await this.server.stop();
  }
}
