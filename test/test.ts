import assert from 'assert';

import neis from '../api/data-accessors/neis';

const menuExample = require('./menu-example.json');

describe('school menu', function () {
    this.timeout(10000);

    it('fetches and returns array of menus from neis server', done => {
        neis('high', 'K100000460', 2018, 7)
        .then(data => {
            assert.strictEqual(data.shouldSave, true);
            assert.deepStrictEqual(data.menu, menuExample);
            done();
        });
    });
});