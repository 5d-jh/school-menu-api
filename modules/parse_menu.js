'use strict';
const request = require('request');
const cheerio = require('cheerio');

function removeBlank(arr) {
  arr.splice(arr.indexOf(''), 1);
  arr.splice(arr.indexOf(' '), 1);
  return arr;
}

module.exports = function (region, school_code, ymd, callback) { 
  var NOMENU_MSG = "급식이 없습니다.";
  var MONTHLY_TABLE = new Array();

  var date = new Date();
  var YEAR = ymd.year || date.getFullYear();
  var MONTH = ymd.month || date.getMonth() + 1;
  var DATE = ymd.date
  if (MONTH < 10) { MONTH = '0' + MONTH }
  var url = `https://stu.${region}.go.kr/sts_sci_md00_001.do?schulCode=${school_code}&schulCrseScCode=4&ay=${YEAR}&mm=${MONTH}`;

  request(url, ($err, $res, $html) => {
    if ($err) throw err;

    var $ = cheerio.load($html, {
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
      callback(MONTHLY_TABLE);
    } else {
      callback(MONTHLY_TABLE);
    }
  });
}