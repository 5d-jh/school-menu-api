const fs = require('fs');
const path = require('path');
// const AWS = require('aws-sdk');
// AWS.config.update({region: 'ap-northeast-2'});
const getMenu = require('./getMenu');

const getCacheFilename = (schoolCode, menuYear, menuMonth) => 
  path.join(__dirname, 'caches', menuYear.toString()+menuMonth.toString()+schoolCode+'.json');

const cacheMenu = (schoolCode, schoolMenu, menuYear, menuMonth, callback) => {
  console.debug('caching')
  const date = new Date();
  date.setSeconds(date.getSeconds() + 15);
  const expiry = date;
  const data = JSON.stringify({
    menu: schoolMenu,
    expiry
  });
  const filepath = getCacheFilename(schoolCode, menuYear, menuMonth);
  fs.writeFile(filepath, data, 'utf8', data, (err) => {
    if (err) return callback(err);
    callback();
  });
}

const getCache = (schoolType, schoolCode, menuYear, menuMonth, callback) => {
  const filepath = getCacheFilename(schoolCode, menuYear, menuMonth);

  const getMenuThenCache = () => {
    getMenu(schoolType, schoolCode, {year: menuYear, month: menuMonth})
    .then((schoolMenu) => {
      callback(schoolMenu);
      cacheMenu(schoolCode, schoolMenu, menuYear, menuMonth, (err) => {
        if (err) throw err;
      });
    });
  }

  fs.readFile(filepath, (err, data) => {
    if (err && err.errno === -2 /*파일이 없을 경우*/) {
      getMenuThenCache();
    } else {
      data = JSON.parse(data);
      if (new Date() > new Date(data.expiry)) {
        getMenuThenCache();
      } else {
        callback(data);
      }
    }
  });
}

module.exports.getCache = getCache;