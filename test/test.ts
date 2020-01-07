import assert from 'assert';

import schoolmenu from '../api/service';
import schoolinfo from '../neis/services/json';

const menuExample = require('./menu-example.json');

describe('school menu', function () {
    this.timeout(10000);

    it('fetches and returns array of menus from neis server or database', done => {
        schoolmenu('high', 'K100000460', { year: '2018', month: '7' })
        .then(data => {
            assert.deepStrictEqual(data.menu, menuExample);
            assert.strictEqual(typeof data.isFetchedFromDB, typeof Boolean());
            done();
        });
    });
});

describe('school info', function () {
    this.timeout(10000);

    it('fetches and returns array of menus from schoolinfo server or database', done => {
        schoolinfo('영월', '1')
        .then(data => {
            assert.notStrictEqual(data.length, 0);
            done();
        });
    });
});