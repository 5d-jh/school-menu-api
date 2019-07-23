const assert = require('assert');

const menuExample = require('./menu-example.json');

const DB = require('../api/db');

describe('db', function() {
  this.timeout(10000);
  
  it('fetches and returns array of menus in database', done => {
    const db = new DB('K100000460', 2018, 7);
    db.get().then(data => {
      assert.deepStrictEqual(data, menuExample);
      done();
    });
  });
});

const neis = require('../api/neis');

describe('neis', function() {
  this.timeout(10000);

  it('fetches and returns array of menus in neis server', done => {
    neis('high', 'K100000460', 2018, 7)
    .then(data => {
      assert.strictEqual(data.shouldSave, true);
      done();
    })
  });
});