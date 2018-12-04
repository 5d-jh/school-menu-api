const process = require('process');
const AWS = require('aws-sdk');
const AWSConfig = require('./AWSConfig.json');

const NODE_ENV = process.env.NODE_ENV;
const Bucket = NODE_ENV === 'development' ? 'school-menu-api-dev' : 'school-menu-api-caches'

AWS.config.update(AWSConfig);
const S3 = new AWS.S3();

const getMenu = require('./getMenu');

class ResponseCache {
  constructor(schoolType, schoolCode, menuYear, menuMonth) {
    this.schoolType = schoolType;
    this.schoolCode = schoolCode;
    this.schoolMenu = [];
    this.menuYear = menuYear;
    this.menuMonth = menuMonth;
  }

  setExpiry() {
    const date = new Date();
    NODE_ENV === 'development' ? date.setMinutes(date.getMinutes() + 3) : date.setDate(date.getDate() + 6);
    return date;
  }

  getObjKey() {
    return this.menuYear.toString()+this.menuMonth.toString()+this.schoolCode+'.json';
  }

  cacheMenu() {
    const expiry = this.setExpiry();
    const schoolMenu = this.schoolMenu;

    const params = {
      Bucket,
      Key: this.getObjKey(this.schoolCode, this.menuYear, this.menuMonth),
      Body: JSON.stringify({schoolMenu, expiry})
    }
    S3.putObject(params).promise()
    .catch(err => err);
  }

  async getMenuThenCache() {
    try {
      const schoolMenu = await getMenu(this.schoolType, this.schoolCode, this.menuYear, this.menuMonth);

      if (schoolMenu.length === 0) {
        throw new Error('식단을 찾을 수 없습니다. 학교 코드를 다시 확인해 주세요.');
      } else {
        this.schoolMenu = schoolMenu;
        this.cacheMenu();
      }
    } catch(err) {
      throw err;
    }
  }

  async getCache() {
    try {
      const params = {
        Bucket,
        Key: this.getObjKey(this.schoolCode, this.menuYear, this.menuMonth)
      };
      const schoolMenuData = await S3.getObject(params).promise().then(data => JSON.parse(data.Body));

      if (new Date() > new Date(schoolMenuData.expiry)) {
        //기한을 넘었을 경우
        await this.getMenuThenCache();
        
        const expiry = this.setExpiry();
        const schoolMenu = this.schoolMenu;
        return {schoolMenu, expiry};
      }
      return schoolMenuData;
    } catch(err) {
      if (err.code === 'NoSuchKey') {
        //오브젝트가 존재하지 않는 경우
        await this.getMenuThenCache()

        const expiry = this.setExpiry;
        const schoolMenu = this.schoolMenu;
        return {schoolMenu, expiry};
      } else {
        throw err;
      }
    }
  }
}

module.exports = ResponseCache;