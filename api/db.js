const AWS = require('aws-sdk');
const process = require('process');

class DB {
  /**
   * @param {string} schoolCode - 학교 고유 NEIS 코드
   * @param {number} menuYear - 식단 년
   * @param {number} menuMonth - 식단 월
   */
  constructor(schoolCode, menuYear, menuMonth) {
    // *** AWS Lambda 가 아닌 환경에서 실행할 경우 다음 코드의 주석을 해제합니다. ***
    require('dotenv').config();
    AWS.config.update({
      region: process.env.AWS_REGION,
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });

    this.docCli = new AWS.DynamoDB.DocumentClient();
    this.tableName = process.env.NODE_ENV === 'development' ? 'SchoolMenu_dev' : 'SchoolMenu';

    this.schoolCode = schoolCode;
    this.menuYear = menuYear;
    this.menuMonth = menuMonth;
  }

  /**
   * @param {{ hideAllergy: boolean|null, date: number|null }} options
   * @returns {Promise<{null|object}>}
   */
  async get() {
    const { Item } = await this.docCli.get({
      TableName: this.tableName,
      Key: {
        'MenuYM': `${this.menuYear}.${this.menuMonth}`,
        'SchoolCode': this.schoolCode,
      }
    }).promise()
    .catch(err => err);

    if (Item === undefined) {
      return null;
    }

    let menu = Item.SchoolMenu.slice();
    
    return menu;
  }

   /**
   * @param {object} menu - 저장할 학교 식단
   */
  async put(menu) {
    return await this.docCli.put({
      TableName: this.tableName,
      Item: {
        'MenuYM': `${this.menuYear}.${this.menuMonth}`,
        'SchoolCode': this.schoolCode,
        'SchoolMenu': menu
      }
    }).promise();
  }
}

module.exports = DB;