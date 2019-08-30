const process = require('process');
const request = require('request');
const jsdom = require('jsdom');
const decodeEntities = require('./decode_entities');

/**
 * @param {"elementary"|"moddle"|"high"} schoolType - 학교 유형
 * @param {string} schoolCode - 학교 고유 NEIS 코드
 * @param {number} menuYear - 식단 년
 * @param {number} menuMonth - 식단 월
 * @returns {Promise<{ shouldSave: boolean, menu: object }>}
 */
const neis = (schoolType, schoolCode, menuYear, menuMonth) => {
  return new Promise((resolve, reject) => {
    schoolType = {
      "elementary": "2",
      "middle": "3",
      "high": "4"
    }[schoolType];

    let schoolRegion;
    if (schoolCode[0] === 'A') {
      //국립 고등학교
      schoolRegion = {
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
      }[schoolCode];
    } else {
      schoolRegion = {B: "sen", E: "ice",
        C: "pen", F: "gen", G: "dje", D: "dge",
        I: "sje", H: "use", J: "goe", K: "kwe",
        M: "cbe", N: "cne", R: "gbe", S: "gne",
        P: "jbe", Q: "jne", T: "jje"
      }[schoolCode[0]];
    }

    if (!schoolRegion) {
      const err = new Error('존재하지 않는 지역입니다. 학교 코드 첫 번째 자리를 다시 확인해 주세요.');
      err.status = 400;
      return reject(err);
    }
    if (menuMonth < 10) { menuMonth = '0' + menuMonth }

    const url = `https://stu.${schoolRegion}.go.kr/sts_sci_md00_001.do?schulCode=${schoolCode}&schulCrseScCode=${schoolType}&ay=${menuYear}&mm=${menuMonth}`;
    if (process.env.NODE_ENV === 'development') console.log(url);

    request(url, (err, _, html) => {
      if (err) return reject(err);

      const { JSDOM } = jsdom;
      const { window } = new JSDOM(html);
      const $ = require('jquery')(window);
    
      const table = [];

      let totalStrlen = 0;
      
      $('td div').each(function () {
        const text = $(this).html();

        if (text.match(/\d/g)) {
          if (text[0].replace('<br>', '') != '') {
            const date = text.split(/\[조식\]|\[중식\]|\[석식\]/);
            const breakfast = /\[조식\](.*?)(\[|$)/g.exec(text) ? /\[조식\](.*?)(\[|$)/g.exec(text)[1] : '';
            const lunch = /\[중식\](.*?)(\[|$)/g.exec(text) ? /\[중식\](.*?)(\[|$)/g.exec(text)[1] : '';
            const dinner = text.match(/\[석식\](.*)/) ? text.match(/\[석식\](.*)/)[1] : '';
            
            table.push({
              date: date[0].replace('<br>', ''),
              breakfast: breakfast ? breakfast.split('<br>').filter(menu => menu) : [],
              lunch: lunch ? lunch.split('<br>').filter(menu => menu) : [],
              dinner: dinner ? dinner.split('<br>').filter(menu => menu) : [],
            });

            table.length != 0 && (
              totalStrlen += breakfast.length + lunch.length + dinner.length
            );
          }
        }
      });

      if (table.length == 0) {
        reject(new Error('식단을 찾을 수 없습니다. 학교 코드를 다시 확인해 주세요.'));
      } else {
        resolve({
          shouldSave: Boolean(totalStrlen) && (
            new Date().getFullYear() >= menuYear && new Date().getMonth()+1 >= menuMonth
          ),
          menu: decodeEntities(table)
        });
      }
    });
  });
}

module.exports = neis;