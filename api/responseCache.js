const AWS = require('aws-sdk');
const AWSConfig = require('./AWSConfig.json');

AWS.config.update(AWSConfig);
const S3 = new AWS.S3();

const getMenu = require('./getMenu');

const getCacheFilename = (schoolCode, menuYear, menuMonth) => 
  menuYear.toString()+menuMonth.toString()+schoolCode+'.json';

const cacheMenu = (schoolCode, schoolMenu, menuYear, menuMonth, callback) => {
  const date = new Date();
  date.setDate(date.getDate() + 6);
  const expiry = date;

  const filename = getCacheFilename(schoolCode, menuYear, menuMonth);

  const params = {
    Bucket: 'school-menu-api-caches',
    Key: filename,
    Body: JSON.stringify({schoolMenu, expiry})
  };
  S3.putObject(params).promise()
  .then(() => callback())
  .catch(err => callback(err));
}

const getCache = (schoolType, schoolCode, menuYear, menuMonth, callback) => {
  const filename = getCacheFilename(schoolCode, menuYear, menuMonth);

  const getMenuThenCache = () => {
    getMenu(schoolType, schoolCode, {year: menuYear, month: menuMonth})
    .then((schoolMenu) => {
      console.log(schoolMenu)
      if (schoolMenu.length === 0) {
        const errMessage = '식단을 찾을 수 없습니다. 학교 코드를 다시 확인해 주세요.';
        return callback(null, new Error(errMessage))
      };

      cacheMenu(schoolCode, schoolMenu, menuYear, menuMonth, (err) => {
        if (err) return callback(null, err);
        callback(schoolMenu[0]);
      });
    })
    .catch(err => callback(null, err));
  }

  const params = {
    Bucket: 'school-menu-api-caches',
    Key: filename
  };
  S3.getObject(params).promise()
  .then(data => JSON.parse(data.Body))
  .then(data => new Date() > new Date(data.expiry) ? getMenuThenCache() : data)
  .then(data => callback(data))
  .catch(err => err.code === 'NoSuchKey' ? getMenuThenCache() : err)
  .catch(err => callback(null, err));
}

module.exports.getCache = getCache;