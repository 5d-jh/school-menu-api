const process = require('process');
const AWS = require('aws-sdk');

const NODE_ENV = process.env.NODE_ENV;
const TableName = NODE_ENV === 'development' ? 'SchoolMenu_dev' : 'SchoolMenu';


// *** AWS Lambda 가 아닌 환경에서 실행할 경우 다음 코드의 주석을 해제합니다. ***
// AWS.config.update({
//   region: process.env.AWS_REGION,
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
// });

const docCli = new AWS.DynamoDB.DocumentClient({ apiVersion: '2012-08-10' });

const getMenu = require('./getMenu');

class ResponseCache {
  constructor(schoolType, schoolCode, menuYear, menuMonth) {
    this.schoolType = schoolType;
    this.schoolCode = schoolCode;
    this.menuYear = menuYear;
    this.menuMonth = menuMonth;
  }

  willStore() {
    const date = new Date();
    date.setMonth(date.getMonth()+1);

    const time = date.getTime() - new Date(this.menuYear, this.menuMonth, date.getDate()).getTime();

    return time >= 0;
  }

  async getMenuThenCache() {
    try {
      const schoolMenu = await getMenu(this.schoolType, this.schoolCode, this.menuYear, this.menuMonth);

      if (schoolMenu && schoolMenu.hasData) {
        docCli.put({
          TableName,
          Item: {
            'MenuYM': `${this.menuYear}.${this.menuMonth}`,
            'SchoolCode': this.schoolCode,
            'SchoolMenu': schoolMenu.menu
          }
        }, err => {
          if (err) throw err;
        });
      }

      return schoolMenu.menu;

    } catch(err) {
      throw err;
    }
  }

  async require() {
    const params = {
      TableName,
      Key: {
        'MenuYM': `${this.menuYear}.${this.menuMonth}`,
        'SchoolCode': this.schoolCode,
      }
    };
    const ddbResult = await docCli.get(params).promise()
    .catch(err => err);

    if (ddbResult.Item === undefined) { //오브젝트가 존재하지 않는 경우
      const isCached = false;

      if (this.willStore()) { //과거 또는 현재 식단을 요쳥한 경우
        return {  
          schoolMenu: await this.getMenuThenCache(),
          isCached
        };
      }

      //미래 식단을 요청한 경우
      const { menu } = await getMenu(this.schoolType, this.schoolCode, this.menuYear, this.menuMonth);
      return {
        schoolMenu: menu,
        isCached
      };
    }

    return { schoolMenu: ddbResult.Item.SchoolMenu, isCached: true }; //returns { menu, isCached }
  }
}

module.exports = (schoolType, schoolCode, menuYear, menuMonth) => {
  return new ResponseCache(schoolType, schoolCode, menuYear, menuMonth);
}