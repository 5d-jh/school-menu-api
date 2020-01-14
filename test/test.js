const assert = require('assert');

const menuExample = require('./menu-example.json');
const { menuService } = require('../menu-service/service');

describe('School menu', function () {
  this.timeout(10000);

  it('fetches and returns array of menus', done => {
    menuService('/high/K100000460', {
      year: 2018,
      month: 7
    })
    .then(data => {
      console.log(data.isFetchedFromDB);
      assert.strictEqual(typeof data.isFetchedFromDB, 'boolean');
      assert.deepStrictEqual(data.menu, menuExample);
      done();
    });
  });

  it('should not save if requested future date of menu', done => {
    menuService('/high/K100000460', {
      year: new Date().getFullYear(),
      month: new Date().getMonth()+2
    })
    .then(data => {
      assert.strictEqual(data.isFetchedFromDB, false);
      done();
    });
  });
});