# 학교급식 API
## 개요 및 특징
GET/POST 요청을 통하여 어떤 플랫폼에서든 학교 급식을 쉽게 불러올 수 있습니다.
[school-api](https://github.com/agemor/school-api) 프로젝트가 제작에 큰 도움이 되었습니다.

한 학교로 한 번 이상 요청 시, 그 학교의 메뉴가 자체 DB에 저장되어 응답 속도가 대폭 개선됩니다. (한 달 동안 급식 내용이 같을 경우 없는 것으로 간주하여 저장하지 않습니다)

유치원, 초등학교, 중학교를 추가로 지원하며, 학교 코드만으로 관할 교육청을 구분할 수 있으므로 인터페이스가 변경되었습니다.

## 학교 유형
 * 유치원 <code>kindergarten</code>
 * 초등학교 <code>elementary</code>
 * 중학교 <code>middle</code>
 * 고등학교 <code>high</code>

## 학교 코드
[여기](https://www.meatwatch.go.kr/biz/bm/sel/schoolListPopup.do)에서 학교 코드를 확인할 수 있습니다.

## GET
<code>https://schoolmenukr.ml/api/[학교유형]/[학교코드]</code>로 현재 달의 급식을 불러올 수 있습니다. 응답 데이터는 JSON 입니다.

### 변수(선택사항)
| 변수명 | 설명 | 예시 |
| :------: | ------ | ---- |
| year | 특정한 년도를 지정하여 해당 년도에 해당하는 급식을 불러옵니다. 기본값은 현재날짜 입니다.	| <code>/api/[학교유형]/[학교코드]?year=2018</code> |
| month | 특정한 달을 지정하여 해당 달에 해당하는 급식을 불러옵니다. 기본값은 현재날짜 입니다. | <code>/api/[학교유형]/[학교코드]?month=5</code> |
| date | 특정한 일을 지정하여 해당 날짜에 해당하는 급식을 불러옵니다. 기본값은 현재날짜 입니다. | <code>/api/[학교유형]/[학교코드]?date=13 </code> |
| nodb | true로 설정 시 DB를 거치지 않고 NEIS에서 직접 급식을 불러옵니다. 기본값은 flase 입니다. | <code>/api/[학교유형]/[학교코드]?nodb=true </code> |

## POST
### 요청 메시지
<code>https://schoolmenukr.ml/api/</code>로 현재 달의 급식을 볼 수 있습니다.
<pre>
{
    "school_type": "학교 유형",
    "school_code": "학교 코드" [,
    "ymd": {
        ["year": "년"][,
        "month": "월"][,
        "date": "일"]
    }]
}
</pre>
region과 school_code의 값은 필수로 입력해야 합니다. 대괄호 친 부분은 선택사항 입니다.

## 예시
### GET
 > Node.js
<pre>
const request = require('request');

request('https://schoolmenukr.ml/api/high/X123456789?date=23', (err, res, body) => {
    var json = JSON.parse(body);
    console.log(json);
});
</pre>
 > Python
<pre>
import requests
import json

response = requests.get('https://schoolmenukr.ml/api/middle/X123456789?year=2018&month=5')
meal_menu = json.loads(response.text)
print(meal_menu)
</pre>

### POST
 > Node.js
<pre>
const request = require('request');

const body = {
  json: {
    school_type: 'middle',
    school_code: 'X123456789'
  }
}

const url = 'https://schoolmenukr.ml/api';

request.post(url, body, (request, res) => {
  console.log(res.body);
});
</pre>

 > Python
 <pre>
import requests
import json

url = 'https://schoolmenukr.ml/api'
body = {
    "region": "high",
    "school_code": "X123456789",
    "ymd": {
        "year": "2018",
        "month": "5",
        "date": "23"
    }
})
headers = {
  "Content-Type": "application/json"
}

response = requests.post(url, data=json.dumps(body), headers=headers)
meal_menu = json.loads(response.text)
print(meal_menu)
</pre>

### 응답
 <pre>
{
    menu: [
        ...,
        {
            date:"1",
            breakfast:["찹쌀밥","홍합미역국5.6.","닭갈비5.6.13.","김구이13.","배추김치9.13.","방울토마토12."],
            lunch:["흑미밥","콩나물국5.13.","돼지등뼈김치찜9.10.13.","도토리묵무침5.6.13.","총각김치9.13.","청포도"],
            dinner:["찹쌀밥","오징어짬뽕국5.6.","배추겉절이13.","포도쥬스5.13.","만두오꼬노미야끼1.5.6.10.12.13."]
        },
        ...
    ],
    server_message: ["foo", "bar", ...]
};
</pre>

## 저작권
해당 소스를 마음대로 수정하거나 재배포 할 수 있습니다. [자세한 정보](https://namu.wiki/w/MIT%20허가서)