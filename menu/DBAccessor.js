const { Firestore } = require('@google-cloud/firestore');

class DB {
  /**
   * @param {string} schoolCode - 학교 고유 NEIS 코드
   * @param {number} menuYear - 식단 년
   * @param {number} menuMonth - 식단 월
   */
  constructor(schoolCode, menuYear, menuMonth) {
    const db = new Firestore();
    this.doc = db.collection('schoolmenu').doc(`${schoolCode}_${menuYear}_${menuMonth}`);

    this.schoolCode = schoolCode;
    this.menuYear = menuYear;
    this.menuMonth = menuMonth;
  }

  /**
   * @param {{ hideAllergy: boolean|null, date: number|null }} options
   * @returns {Promise<{null|object}>}
   */
  async get() {
    return await this.doc.get()
    .then(
      doc => doc.exists ? doc.data().schoolMenu : null
    );
  }

   /**
   * @param {object} menu - 저장할 학교 식단
   */
  async put(menu) {
    return await this.doc.set({
      schoolMenu: menu,
      version: 2
    });
  }
}

exports.DB = DB;