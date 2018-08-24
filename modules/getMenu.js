const request = require('request');
const jsdom = require('jsdom');
//models
const School = require('../models/school');
const Menu = require('../models/menu');

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

class GetMenu {
  constructor(type, region, code, date) {
    const schoolTypes = {
      "kindergarten": "1",
      "elementary": "2",
      "middle": "3",
      "high": "4"
    };
    this.type = schoolTypes[type];
    this.region = region;
    this.code = code;
    this.date = date;
  }

  initSchool(callback) {
    const school = new School();
    school.type = this.type;
    school.retgon = this.region;
    school.code = this.code;

    School.findOne({code: this.code}, (err, schoolData) => {
      if (err) return callback(err);
      if (!schoolData) {
        school.save(err => {
          if (err) reject(err);
          console.debug('saving school..');
          this.initSchool(callback);
        });
      } else {
        this.schoolId = schoolData._id;
        callback();
      }
    });
  }

  database(callback) {
    const menu = new Menu();
    menu.year = this.date.year;
    menu.month = this.date.month;
    console.debug('1', {school_id: String(this.schoolId)});

    Menu.findOne({school_id: String(this.schoolId), year: this.date.year, month: this.date.month}, (err, table) => {
      if (err) return callback(null, err);
      if (!table) {
        this.neis(fetchedTable => {
          if (isAllSame(fetchedTable)) {
            console.debug('Menus are all same. Abort saving.');
            return callback({menu: fetchedTable});
          }

          menu.school_id = this.schoolId;
          menu.menu = fetchedTable;
          menu.save(err => {
            if (err) reject(err);
            this.database(callback);
          });
        });
      } else {
        let date = this.date.date;
        if (date) {
          table = {
            menu: table.menu[date-1]
          }
        }
        
        callback(table);
      }
    });
  }
  
  neis(callback) {
    const NOMENU_MSG = "급식이 없습니다.";
    let year = this.date.year;
    let month = this.date.month;
    if (month < 10) { month = '0' + month }
    const url = `https://stu.${this.region}.go.kr/sts_sci_md00_001.do?schulCode=${this.code}&schulCrseScCode=${this.type}&ay=${year}&mm=${month}`;
    
    console.debug(url);
    request(url, (err, res, html) => {
      console.debug('fetching from neis...');
      if (err) throw err;

      const { JSDOM } = jsdom;
      const { window } = new JSDOM(html);
      const $ = require('jquery')(window);
    
      let table = [];
      
      $('td div').each(function () {
        var text = $(this).html();
        text = text.split(/\[조식\]|\[중식\]|\[석식\]/);
        if (text != ' ') {
          table.push({
            date: text[0].replace('<br>', ''),
            breakfast: text[1] ? removeBlank(text[1].split('<br>')) : NOMENU_MSG,
            lunch: text[2] ? removeBlank(text[2].split('<br>')) : NOMENU_MSG,
            dinner: text[3] ? removeBlank(text[3].split('<br>')) : NOMENU_MSG,
          });
        }
      });
      
      callback(table);
    });
  }
}

module.exports = GetMenu;