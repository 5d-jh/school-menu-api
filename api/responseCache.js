const AWS = require('aws-sdk');
const AWSConfig = require('./AWSConfig.json');

AWS.config.update(AWSConfig);
const S3 = new AWS.S3();

const getMenu = require('./getMenu');

const getCacheFilename = (schoolCode, menuYear, menuMonth) => 
  menuYear.toString()+menuMonth.toString()+schoolCode+'.json';

const cacheMenu = (schoolCode, schoolMenu, menuYear, menuMonth, callback) => {
  console.debug('caching')
  const date = new Date();
  date.setDate(date.getDate() + 6);
  const expiry = date;

  const filename = getCacheFilename(schoolCode, menuYear, menuMonth);

  const params = {
    Bucket: 'school-menu-api-caches',
    Key: filename,
    Body: JSON.stringify({schoolMenu, expiry})
  };
  console.log(filename);
  S3.putObject(params).promise()
  .then(() => callback())
  .catch(err => callback(err));
}

const getCache = (schoolType, schoolCode, menuYear, menuMonth, callback) => {
  const filename = getCacheFilename(schoolCode, menuYear, menuMonth);

  const getMenuThenCache = () => {
    getMenu(schoolType, schoolCode, {year: menuYear, month: menuMonth})
    .then((schoolMenu) => {
      
      cacheMenu(schoolCode, schoolMenu, menuYear, menuMonth, (err) => {
        if (err) throw err;
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
  .then(data => {
    if (new Date() > new Date(data.expiry)) {
      getMenuThenCache();
    }
    return data;
  })
  .then(data => callback(data))
  .catch(err => {
    if (err.code === 'NoSuchKey') {
      getMenuThenCache();
    }
    return err;
  })
  .catch(err => callback(null, err));
}

module.exports.getCache = getCache;