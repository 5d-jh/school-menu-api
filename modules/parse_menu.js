'use strict';
const request = require('request');
const cheerio = require('cheerio');

function removeBlank(arr) {
  arr.splice(arr.indexOf(''), 1);
  arr.splice(arr.indexOf(' '), 1);
  return arr;
}

const schoolTypes = {
  "kindergarten": "1",
  "elementary": "2",
  "middle": "3",
  "high": "4"
};

module.exports = function (region, schoolCode, schoolType, ymd, callback) { 
  let err = null;

  const NOMENU_MSG = new Array("급식이 없습니다.");
  let MONTHLY_TABLE = new Array();
  
  const schoolTypeNum = schoolTypes[schoolType] || callback([], "오류: 알 수 없는 학교 유형");

  const date = new Date();
  let YEAR = ymd.year || date.getFullYear();
  let MONTH = ymd.month || date.getMonth() + 1;
  let DATE = ymd.date;
  if (MONTH < 10) { MONTH = '0' + MONTH }
  const url = `https://stu.${region}.go.kr/sts_sci_md00_001.do?schulCode=${schoolCode}&schulCrseScCode=${schoolTypeNum}&ay=${YEAR}&mm=${MONTH}`;

  request(url, ($err, $res, $html) => {
    if ($err) throw $err;

    const $ = cheerio.load($html, {
      decodeEntities: false
    });

    $('td div').each(function (i) {
      var text = $(this).html();
      text = text.split(/\[조식\]|\[중식\]|\[석식\]/);
      if (text != ' ') {
        MONTHLY_TABLE.push({
          date: text[0].replace('<br>', ''),
          breakfast: text[1] ? removeBlank(text[1].split('<br>')) : NOMENU_MSG,
          lunch: text[2] ? removeBlank(text[2].split('<br>')) : NOMENU_MSG,
          dinner: text[3] ? removeBlank(text[3].split('<br>')) : NOMENU_MSG,
        });
      }
    });

    if (DATE) {
      MONTHLY_TABLE = [MONTHLY_TABLE[DATE-1]];
    }
    callback(MONTHLY_TABLE, err);
  });
}