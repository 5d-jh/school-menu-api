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
    this.menuYear = menuYear;
    this.menuMonth = menuMonth;
    this.haveData = false;
  }

  setExpiry() {
    if (!this.haveData) {
      return null;
    }

    const date = new Date();

    const condition = ((date.getFullYear() < this.menuYear) ||
      ((date.getMonth()+1 < this.menuMonth)));
      
    if (condition) {
      date.setDate(date.getDate() + 1);
    } else {
      NODE_ENV === 'development'
      ? date.setMinutes(date.getMinutes() + 2)
      : date.setFullYear(date.getFullYear() + 3);
    }

    return date;
  }

  getObjKey() {
    return this.menuYear.toString()+this.menuMonth.toString()+this.schoolCode+'.json';
  }

  checkHaveData(arr) {
    arr = JSON.parse(JSON.stringify(arr));
    for (let i = 0; i < arr.length-1; i++) {
      const front = arr[i].breakfast.length + arr[i].lunch.length + arr[i].dinner.length;
      const back = arr[i+1].breakfast.length + arr[i+1].lunch.length + arr[i+1].dinner.length;
      if (front + back !== 0) {
        this.haveData = true;
        return;
      }
    }
  }

  cacheMenu(schoolMenu) {
    const expiry = this.setExpiry();

    const params = {
      Bucket,
      Key: this.getObjKey(this.schoolCode, this.menuYear, this.menuMonth),
      Body: JSON.stringify({schoolMenu, expiry})
    };
    S3.putObject(params).promise()
    .catch(err => err);
  }

  async getMenuThenCache() {
    try {
      const schoolMenu = await getMenu(this.schoolType, this.schoolCode, this.menuYear, this.menuMonth);

      this.checkHaveData(schoolMenu);

      if (this.haveData) {
        this.cacheMenu(schoolMenu);
      }

      if (schoolMenu.length !== 0) {
        return schoolMenu;
      } else {
        throw new Error('식단을 찾을 수 없습니다. 학교 코드를 다시 확인해 주세요.');
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
        //기한이 넘었을 경우
        const expiry = this.setExpiry();
        const schoolMenu = await this.getMenuThenCache();
        return {schoolMenu, expiry};
      }

      return schoolMenuData;

    } catch(err) {
      if (err.code === 'NoSuchKey') {
        //오브젝트가 존재하지 않는 경우
        const expiry = this.setExpiry();
        const schoolMenu = await this.getMenuThenCache();
        return {schoolMenu, expiry};
      } else {
        throw err;
      }
    }
  }
}

module.exports = (schoolType, schoolCode, menuYear, menuMonth) => {
  return new ResponseCache(schoolType, schoolCode, menuYear, menuMonth);
}