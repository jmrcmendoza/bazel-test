import sinon from 'sinon';
import initializeModels from 'src/model/rethinkdb';
import Rethinkdb from 'src/library/rethinkdb';

before(async function () {
  this.sandbox = sinon.createSandbox();

  await Rethinkdb.start();
  await initializeModels();
});

after(async function () {
  this.sandbox.restore();
});
