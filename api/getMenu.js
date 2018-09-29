const request = require('request');
const jsdom = require('jsdom');
//models
const School = require('./model');

function removeBlank(arr) {
  arr.splice(arr.indexOf(''), 1);
  arr.splice(arr.indexOf(' '), 1);
  return arr;
}

function isAllSame(arr) {
  for (let i = 0; i < arr.length-1; i++) {
    let pre = [arr[i].breakfast, arr[i].lunch, arr[i].dinner];
    let post = [arr[i+1].breakfast, arr[i+1].lunch, arr[i+1].dinner];
    if (JSON.stringify(pre) != JSON.stringify(post)) {
      return false
    }
  }
  return true
}

module.exports = class {
  constructor(type, region, code, date) {
    const schoolTypes = {
      "elementary": "2",
      "middle": "3",
      "high": "4"
    };
    this.type = schoolTypes[type];
    this.region = region;
    this.code = code;
    this.date = date;
  }

  fromDB(callback) {
    School.findOne({schoolCode: this.code, menuYear: this.date.year, menuMonth: this.date.month}, (err, data) => {
      if (err) return callback(null, err);
      if (!data) {
        this.fromNEIS(fetchedTable => {
          if (fetchedTable === null) {
            return callback(null, new Error('식단표를 찾을 수 없습니다. 학교 코드를 다시 확인해 주세요.')); 
          }
          if (isAllSame(fetchedTable)) {
            return callback({menu: fetchedTable});
          }

          const school = new School({
            schoolCode: this.code,
            schoolRegion: this.region,
            schoolType: Number(this.type),
            menuTable: fetchedTable,
            menuYear: Number(this.date.year),
            menuMonth: Number(this.date.month)
          });
          school.save(err => {
            if (err) return callback(null, err);
            this.fromDB(callback);
          });
        })
      } else {
        let date = this.date.date;
        if (date) {
          callback(data.menuTable[date-1]);
        } else {
          callback(data.menuTable);
        }
      }
    });
  }

  fromNEIS(callback) {
    const NOMENU_MSG = ["급식이 없습니다."];
    let year = this.date.year;
    let month = this.date.month;
    if (month < 10) { month = '0' + month }

    const url = `https://stu.${this.region}.go.kr/sts_sci_md00_001.do?schulCode=${this.code}&schulCrseScCode=${this.type}&ay=${year}&mm=${month}`;
    console.debug(url);

    request(url, (err, res, html) => {
      if (err) return callback(null, err);

      const { JSDOM } = jsdom;
      const { window } = new JSDOM(html);
      const $ = require('jquery')(window);
    
      let table = [];
      
      $('td div').each(function () {
        var text = $(this).html();
        text = text.split(/\[조식\]|\[중식\]|\[석식\]/);
        if (text != ' ') {
          if (text[0].replace('<br>', '') != '') {
            table.push({
              date: text[0].replace('<br>', ''),
              breakfast: text[1] ? removeBlank(text[1].split('<br>')) : NOMENU_MSG,
              lunch: text[2] ? removeBlank(text[2].split('<br>')) : NOMENU_MSG,
              dinner: text[3] ? removeBlank(text[3].split('<br>')) : NOMENU_MSG,
            });
          }
          
        }
      });
      
      callback(table);
    });
  }
}