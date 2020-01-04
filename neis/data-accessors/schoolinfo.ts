import request from 'request';

import { SchoolInfoType } from '../types';

export default (searchSchoolName: string, page: number = 1): Promise<{
    school_infos: SchoolInfoType[]
}> => new Promise(
    (reject, resolve) => {

        const url = 'https://www.schoolinfo.go.kr/ei/ss/Pneiss_f01_l0.do';
        const headers = {
            'Origin': 'https://www.schoolinfo.go.kr',
            'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
        };
        const form = {
            'SEARCH_SCHUL_NM': searchSchoolName,
            'pageNumber': page,
            'callbackMode': 'json',
            'schulCrseScCode': '',
            'hsKndScCode': '',
            'fondScCode': ''
        };
        
        request.post(url, { headers, form }, (err, _, body) => {

            if (err) {
                return reject(err);
            }

            const result = JSON.parse(body).map(
                data => ({
                    address: data["ADDRESS"],
                    code: data["SCHUL_CODE"],
                    name: data["SCHUL_NM"],
                    region: data["LCTN_NM"],
                    type: {
                        '02': 'elementary',
                        '03': 'middle',
                        '04': 'high',
                        '05': 'special'
                    }[ data["SCHUL_CRSE_SC_CODE"] ]
                })
            );

            resolve({ school_infos: result });

        });

    }
)