const process = require('process');
const AWS = require('aws-sdk');

const NODE_ENV = process.env.NODE_ENV;
const Bucket = NODE_ENV === 'development' ? 'school-menu-api-dev' : 'school-menu-api-caches';


// *** AWS Lambda 가 아닌 환경에서 실행할 경우 다음 코드의 주석을 해제합니다. ***
// AWS.config.update({
//   region: process.env.AWS_REGION,
//   accessKeyId: process.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
// });

const S3 = new AWS.S3();

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

  getObjKey() {
    return this.menuYear.toString()+this.menuMonth.toString()+this.schoolCode+'.json';
  }

  cacheMenu(schoolMenu) {
    const params = {
      Bucket,
      Key: this.getObjKey(this.schoolCode, this.menuYear, this.menuMonth),
      Body: JSON.stringify({ schoolMenu, isCached: true })
    };
    S3.putObject(params).promise()
    .catch(err => err);
  }

  async getMenuThenCache() {
    try {
      const schoolMenu = await getMenu(this.schoolType, this.schoolCode, this.menuYear, this.menuMonth);

      if (schoolMenu.hasData) {
        this.cacheMenu(schoolMenu.menu);
      }

      return schoolMenu.menu;

    } catch(err) {
      throw err;
    }
  }

  async require() {
    try {
      const params = {
        Bucket,
        Key: this.getObjKey(this.schoolCode, this.menuYear, this.menuMonth)
      };
      const schoolMenuData = await S3.getObject(params).promise()
      .then(data => JSON.parse(data.Body));

      return schoolMenuData; //returns { menu, isCached }

    } catch(err) {
      if (err.code === 'NoSuchKey') {
        //오브젝트가 존재하지 않는 경우
        if (this.willStore()) {
          //과거 또는 현재 식단을 요쳥한 경우
          return {  
            schoolMenu: await this.getMenuThenCache(),
            isCached: false
          };
        }

        //미래 식단을 요청한 경우
        const { menu } = await getMenu(this.schoolType, this.schoolCode, this.menuYear, this.menuMonth);
        return {
          schoolMenu: menu,
          isCached: false
        };
        
      } else {
        throw err;
      }
    }
  }
}

module.exports = (schoolType, schoolCode, menuYear, menuMonth) => {
  return new ResponseCache(schoolType, schoolCode, menuYear, menuMonth);
}