const process = require('process');
const request = require('request');
const jsdom = require('jsdom');
const entities = require('entities');

/**
 * @param {"elementary"|"moddle"|"high"} schoolType - 학교 유형
 * @param {string} schoolCode - 학교 고유 NEIS 코드
 * @param {number} menuYear - 식단 년
 * @param {number} menuMonth - 식단 월
 * @returns {Promise<{ shouldSave: boolean, menu: object }>}
 */
exports.crawler = (schoolType, schoolCode, menuYear, menuMonth) => {
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
    if (menuMonth < 0) {
      const err = new Error('지정한 월이 유효하지 않습니다.');
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
    
      const table = []; //식단을 저장하는 배열

      let hasNoData = true; //NEIS 페이지에 요일 정보가 있는지 없는지 확인
      
      $('td div').each(function () {
        const text = entities.decodeHTML5($(this).html());

        const date = text.split(/\[조식\]|\[중식\]|\[석식\]/)[0].replace('<br>', '').trim();
          /*
          [예시]
          '3 <br>[중식]고등어' =(1)=> '3 <br>' =(2)=> '3 ' =(3)=> '3'
          [설명]
          (1) 텍스트 '[조식]' 또는 '[중식]' 또는 '[석식]' 중 하나를 기준으로 나눈 배열의 첫 번째 원소를 고름
          (2) 첫 번째 원소의 <br> 태그를 제거함
          (3) 문자의 공백을 제거함
          */
        if (date/* 날짜 정보가 있는 경우에만 배열에 식단을 저장함 */) {
          const breakfast = /\[조식\](.*?)(\[|$)/g.exec(text) && /\[조식\](.*?)(\[|$)/g.exec(text)[1];
            /*
            [예시]
            '[조식]고등어<br>참치[' => '고등어<br>참치'
            [설명]
             * 텍스트 '[조식]'과 '[' 사이에 있는 모든 텍스트를 저장함
             * RegExp.prototype.exec()의 첫 번째 원소에는 '[조식]'과 '['가 포함된 일치된 문자열이지만, 두 번째 원소는 두 텍스트가 제외됨
              - 자세한 사향은 해당 링크 참조: https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
            */
          const lunch = /\[중식\](.*?)(\[|$)/g.exec(text) && /\[중식\](.*?)(\[|$)/g.exec(text)[1];
            /*
            [설명]
             * 텍스트 '[중식]'과 '[' 사이에 있는 모든 텍스트를 저장함.
             * 이하동문
            */
          const dinner = text.match(/\[석식\](.*)/) && text.match(/\[석식\](.*)/)[1];
            /*
            [설명]
             * 텍스트 '[석식]' 뒤에 있는 모든 텍스트를 저장함.
            */

          table.push({
            date,
            breakfast: breakfast ? breakfast.split('<br>').filter(menu => menu) : [],
              /*
              [예시]
              '고등어<br>참치<br>' =(1)=> ['고등어', '참치', ''] =(2)=> ['고등어', '참치']
              [설명]
              (1) split 함수를 사용하여 텍스트 '<br>'을 기준으로 배열로 나눔 
              (2) fliter 함수를 사용하여 배열에 빈 텍스트는 저장하지 않음(JS에서 빈 문자열은 false임)
              */
            lunch: lunch ? lunch.split('<br>').filter(menu => menu) : [],
            dinner: dinner ? dinner.split('<br>').filter(menu => menu) : [],
          });

          if (hasNoData) {
            hasNoData = !(breakfast || lunch || dinner);
          }
        }
      });

      if (table.length === 0/* 식단표에 날짜 정보가 전혀 없는 경우. 보통 날짜를 비정상적으로 지정할 경우 이러함 */) {
        reject(new Error('식단을 찾을 수 없습니다. 학교 코드를 다시 확인해 주세요.'));
      } else {
        resolve({
          shouldSave: !hasNoData && (new Date() >= new Date(menuYear, menuMonth-1)),
            /* 식단에 아무 문자열도 없거나 미래의 식단을 요청하는 경우 저장하지 않음 */
          menu: table
        });
      }
    });
  });
}