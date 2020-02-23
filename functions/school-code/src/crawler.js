const request = require('request');

exports.crawler = (searchKeyword='', pageNum='1') => new Promise(
  (resolve, reject) => {
    if (searchKeyword.length === 0) {
      resolve([]);
    }

    const uri = 'https://www.schoolinfo.go.kr/ei/ss/Pneiss_f01_l0.do';
    const form = {
      'SEARCH_SCHUL_NM': searchKeyword,
      'pageNumber': pageNum,
      'callbackMode': 'json',
      'schulCrseScCode': '',
      'hsKndScCode': '',
      'fondScCode': ''
    };
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    };

    request.post(uri, { form, headers }, (err, _, body) => {
      if (err) reject(err);
      
      const result = JSON.parse(body);
      if (result instanceof Array) {
        resolve(
          result.map(schoolInfo => ({
            code: schoolInfo['SCHUL_CODE'],
            name: schoolInfo['SCHUL_NM'],
            type: {
              '02': 'elementary',
              '03': 'middle',
              '04': 'high',
              '05': 'special'
            }[schoolInfo['SCHUL_CRSE_SC_CODE']],
            address: schoolInfo['ADDRESS']
          }))
        );
      }

      const error = new Error('파싱에 실패했습니다. 가져온 결과값이 배열이 아닙니다.');
      error.code = 500;
      reject(error);
    });
  }
);