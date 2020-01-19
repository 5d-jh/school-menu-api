const { Firestore } = require('@google-cloud/firestore');
const process = require('process');
const path = require('path');

class DB {
  /**
   * @param {string} schoolCode - 학교 고유 NEIS 코드
   * @param {number} menuYear - 식단 년
   * @param {number} menuMonth - 식단 월
   */
  constructor(schoolCode, menuYear, menuMonth) {
    this.db = process.env.NODE_ENV === 'ci' ? (
      new Firestore({
        keyFilename: path.resolve(__dirname, '../school-api-265018-0ae0e4cd0267.json')
      })
    ) : (
      new Firestore()
    );

    this.ref = this.db.collection('schoolmenu');

    this.schoolCode = schoolCode;
    this.menuYear = menuYear;
    this.menuMonth = menuMonth;
  }

  /**
   * @param {{ hideAllergy: boolean|null, date: number|null }} options
   * @returns {Promise<{null|object}>}
   */
  async get() {
    return await this.ref
    .where('schoolCode', '==', this.schoolCode)
    .where('menuYear', '==', this.menuYear)
    .where('menuMonth', '==', this.menuMonth)
    .get()
    .then(snapshots => (
      snapshots.docs.length === 0 ? null : snapshots.docs[0].data().menu
    ));
  }

   /**
   * @param {object} menu - 저장할 학교 식단
   */
  async put(menu) {
    return await this.ref.doc().set({
      menu,
      version: 2,
      schoolCode: this.schoolCode,
      menuYear: this.menuYear,
      menuMonth: this.menuMonth
    });
  }

  close() {
    this.db.terminate();
  }
}

exports.DB = DB;