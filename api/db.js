const AWS = require('aws-sdk');
const process = require('process');
const entities = require('entities')

require('dotenv').config();

class DB {
  /**
   * @param {string} schoolCode - 학교 고유 NEIS 코드
   * @param {number} menuYear - 식단 년
   * @param {number} menuMonth - 식단 월
   */
  constructor(schoolCode, menuYear, menuMonth) {
    if (process.env.NODE_ENV === 'local' || process.env.NODE_ENV === 'development') {
      // AWS Lambda 밖에서 실행될 경우 관련 정보 업데이트
      AWS.config.update({
        region: process.env.AWS_REGION,
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
      });
    }
    
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
    /**
     * @param {array} menu
     * @returns {array}
     */
    const decodeEntities = (menu) => (
      menu.map(day => (
        day.breakfast && day.lunch && day.dinner && {
          date: day.date,
          breakfast: day.breakfast.map(menu => entities.decodeHTML5(menu)),
          lunch: day.lunch.map(menu => entities.decodeHTML5(menu)),
          dinner: day.dinner.map(menu => entities.decodeHTML5(menu))
        }
      ))
    );

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

    if (Item.Version < 2) {
      return decodeEntities(Item.SchoolMenu.slice());
    }

    return Item.SchoolMenu.slice();
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
        'SchoolMenu': menu,
        'Version': 2
          //Version1: HTML 엔티티가 decode되어있지 않음
          //Version2: HTML 엔티티가 decode되어있음
      }
    }).promise();
  }
}

module.exports = DB;