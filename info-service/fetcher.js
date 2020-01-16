const request = require('request');

exports.fetcher = (school='', page=1) => new Promise(
  (resolve, reject) => {
    const uri = 'https://www.schoolinfo.go.kr/ei/ss/Pneiss_f01_l0.do';
    const form = {
      'SEARCH_SCHUL_NM': school,
      'pageNumber': page,
      'callbackMode': "json",
      'schulCrseScCode': '',
      'hsKndScCode': '',
      'fondScCode': ''
    };
    const headers = {
      'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
    };
    request.post(uri, { form, headers }, (err, _, body) => {
      if (err) {
        reject(err);
      }

      try {
        const response = JSON.parse(body);
        resolve(response.map(
          schoolInfo => ({
            code: schoolInfo['SCHUL_CODE'],
            name: schoolInfo['SCHUL_NM'],
            address: schoolInfo['ADDRESS'],
            type: {
              '02': 'elementary',
              '03': 'middle',
              '04': 'high',
              '05': 'special'
            }[schoolInfo['SCHUL_CRSE_SC_CODE']]
          })
        ));
      } catch(err) {
        reject(err);
      }
    });
  }
);
  
