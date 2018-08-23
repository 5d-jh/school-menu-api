const request = require('request');
const cheerio = require('cheerio');
//models
const School = require('../models/school');
const Menu = require('../models/menu');

function removeBlank(arr) {
  arr.splice(arr.indexOf(''), 1);
  arr.splice(arr.indexOf(' '), 1);
  return arr;
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
    this.date = date || new Date();
  }

  initSchool(callback) {
    const school = new School();
    school.type = this.type;
    school.retgon = this.region;
    school.code = this.code;

    School.findOne({code: this.code}, (err, schoolData) => {
      if (err) reject(err);
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
    menu.year = this.date.getFullYear();
    menu.month = this.date.getMonth() + 1;
    console.debug('1', {school_id: String(this.schoolId)});

    Menu.findOne({school_id: String(this.schoolId)}, (err, table) => {
      if (err) reject(err);
      if (!table) {
        console.debug('2', table);
        
        this.neis(fetchedTable => {
          menu.school_id = this.schoolId;
          menu.menu = fetchedTable;
          menu.save(err => {
            if (err) reject(err);
            this.database(callback);
          });
        });
      } else {
        let date = this.date.getDate();
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
    let year = this.date.getFullYear();
    let month = this.date.getMonth() + 1;
    let date = this.date.getDate()
    if (month < 10) { month = '0' + month }
    const url = `https://stu.${this.region}.go.kr/sts_sci_md00_001.do?schulCode=${this.code}&schulCrseScCode=${this.type}&ay=${year}&mm=${month}`;
    
    request(url, (err, res, html) => {
      console.debug('fetching from neis...');
      if (err) throw err;

      const $ = cheerio.load(html, {
        decodeEntities: false
      });
      
      let table = [];
      $('td div').each(function (i) {
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

      if (date) {
        table = [table[date-1]];
      }

      callback(_monthlyTable);
    });
  }
}

module.exports = GetMenu;