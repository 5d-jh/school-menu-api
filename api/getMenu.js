const request = require('request');
const jsdom = require('jsdom');
//models
const School = require('./model');

const removeBlank = (arr) => {
  let blankRemovedArr = [];
  for (const i in arr) {
    if (arr[i]) {
      blankRemovedArr.push(arr[i])
    }
  }
  return blankRemovedArr;
}

const isAllSame = (arr) => {
  for (let i = 0; i < arr.length-1; i++) {
    let former = [arr[i].breakfast, arr[i].lunch, arr[i].dinner];
    let latter = [arr[i+1].breakfast, arr[i+1].lunch, arr[i+1].dinner];
    if (JSON.stringify(former) != JSON.stringify(latter)) {
      return false
    }
  }
  return true
}

module.exports = class {
  constructor(type, code, date) {
    const schoolTypes = {
      "elementary": "2",
      "middle": "3",
      "high": "4"
    };
    this.type = schoolTypes[type];

    const regions = {A: "national", B: "sen", E: "ice", C: "pen", F: "gen", G: "dje", D: "dge", I: "sje", H: "use",
                 J: "goe", K: "kwe", M: "cbe", N: "cne", R: "gbe", S: "gne", P: "jbe", Q: "jne", T: "jje"};
    const nationalHigh = {
      "A000003488": "kwe",
      "A000003490": "dge",
      "A000003495": "gne",
      "A000003496": "cne",
      "A000003509": "pen",
      "A000003561": "sen",
      "A000003516": "gen",
      "A000003520": "jbe",
      "A000003566": "jje",
      "A000003569": "cbe"
    };
    let region = regions[code[0]];
    if (!region) {
      const err = new Error('존재하지 않는 지역입니다. 학교 코드 첫 번째 자리를 다시 확인해 주세요.');
      err.status = 400;
      throw err;
    }
    if (region === "national") region = nationalHigh[code];

    this.region = region;
    this.code = code;
    this.date = date;
  }

  fromDB(callback) {
    School.findOne({schoolCode: this.code, menuYear: this.date.year, menuMonth: this.date.month}).lean().exec((err, data) => {
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
        callback(data.menuTable);
      }
    });
  }

  fromNEIS(callback) {
    const NOMENU_MSG = [];
    let year = this.date.year;
    let month = this.date.month;
    if (month < 10) { month = '0' + month }

    const url = `https://stu.${this.region}.go.kr/sts_sci_md00_001.do?schulCode=${this.code}&schulCrseScCode=${this.type}&ay=${year}&mm=${month}`;

    request(url, (err, res, html) => {
      if (err) return callback(null, err);

      const { JSDOM } = jsdom;
      const { window } = new JSDOM(html);
      const $ = require('jquery')(window);
    
      let table = [];
      
      $('td div').each(function () {
        const text = $(this).html();

        if (text.match(/\d/g)) {
          if (text[0].replace('<br>', '') != '') {
            const date = text.split(/\[조식\]|\[중식\]|\[석식\]/);
            const breakfast = /\[조식\](.*?)(\[|$)/g.exec(text) ? /\[조식\](.*?)(\[|$)/g.exec(text)[1] : '';
            const lunch = /\[중식\](.*?)(\[|$)/g.exec(text) ? /\[중식\](.*?)(\[|$)/g.exec(text)[1] : '';
            const dinner = text.match(/\[석식\](.*)/) ? text.match(/\[석식\](.*)/)[1] : '';
            //식단표에 수정을 가하는 코드를 작성할 경우 이 줄 다음부터 작성
            table.push({
              date: date[0].replace('<br>', ''),
              breakfast: breakfast ? removeBlank(breakfast.split('<br>')) : NOMENU_MSG,
              lunch: lunch ? removeBlank(lunch.split('<br>')) : NOMENU_MSG,
              dinner: dinner ? removeBlank(dinner.split('<br>')) : NOMENU_MSG,
            });
          }
          
        }
      });
      
      callback(table);
    });
  }
}