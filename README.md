# 학교급식 API
## 최근 업데이트
### 2018-07-29
 - 이제 POST 요청을 지원합니다.

### 2018-07-22
 - 이제 일별 보기를 지원합니다.
 - month 변수를 사용하지 않을 경우 현재 달이 아닌 이전 달을 표시하던 문제를 수정하였습니다.

## 개요
GET/POST 요청을 통하여 어떤 플랫폼에서든 학교 급식을 쉽게 불러올 수 있습니다.
[school-api](https://github.com/agemor/school-api) 프로젝트가 제작에 큰 도움이 되었습니다.

## GET
<code>https://schoolmenukr.ml/api/[관할교육청]/[학교코드]</code>로 현재 달의 급식을 불러올 수 있습니다. 응답 데이터는 JSON 입니다.

### 변수(선택사항)
| 변수명 | 설명 | 예시 | 예시 설명 |
| :------: | ------ | ---- | ---- |
| year | 특정한 년도를 지정하여 해당 년도에 해당하는 급식을 불러옵니다.	| <code>/api/[관할교육청]/[학교코드]?year=2018</code> |2018년도 현재달 급식 불러오기 |
| month | 특정한 달을 지정하여 해당 달에 해당하는 급식을 불러옵니다. | <code>/api/[관할교육청]/[학교코드]?month=5</code> | 현재년도 5월달 급식 불러오기 |
| date | 특정한 달을 지정하여 해당 날짜에 해당하는 급식을 불러옵니다. | <code>/api/[관할교육청]/[학교코드]?date=13 </code> | 현재 달에서 13일 급식 불러오기 |

## POST
### 요청 메시지
<code>https://schoolmenukr.ml/api/</code>로 현재 달의 급식을 볼 수 있습니다.
<pre>
{
    json: {
        region: '[관할교육청]'.
        school_code: '[학교 코드]',
        ymd: {
            year: [년],
            month: [월],
            date: [일]
        }
    }
}
</pre>
ymd는 선택 사항입니다. 예를 들어 ymd 전체를 따로 지정하고 싶지 않다면 json내부의 키값인 ymd를 쓰지 않으면 되며, ymd에서 date를 따로 지정하고 싶지 않다면 ymd 내부의 키값인 date를 쓰지 않으면 됩니다.

## 관할 교육청
 - 서울: <code>**sen**</code>
 - 인천: <code>**ice**</code>
 - 부산: <code>**pen**</code>
 - 광주: <code>**gen**</code>
 - 대전: <code>**dje**</code>
 - 대구: <code>**dge**</code>
 - 세종: <code>**sje**</code>
 - 울산: <code>**use**</code>
 - 경기: <code>**goe**</code>
 - 강원: <code>**kwe**</code>
 - 충북: <code>**cbe**</code>
 - 충남: <code>**cne**</code>
 - 경북: <code>**gbe**</code>
 - 경남: <code>**gne**</code>
 - 전북: <code>**jbe**</code>
 - 전남: <code>**jne**</code>
 - 제주: <code>**jje**</code>

## 학교 코드
[여기](https://www.meatwatch.go.kr/biz/bm/sel/schoolListPopup.do)에서 학교 코드를 확인할 수 있습니다.


## 예시
### GET
 > Node.js
<pre>
const request = require('request');

request('https://schoolmenukr.ml/api/sen/A123456789?year=2018&month=5', (err, res, body) => {
    var json = JSON.parse(body);
    console.log(json);
});
</pre>
 > Python
<pre>
import requests
import json

response = requests.get('https://schoolmenukr.ml/api/sen/A123456789?year=2018&month=5')
meal_menu = json.loads(response.text)
print(meal_menu)
</pre>

### POST
 > Node.js
<pre>
const request = require('request');

const body = {
  json: {
    region: 'sen',
    school_code: 'A123456789',
    ymd: {
        year: 2018,
        month: 5
    }
  }
}

const url = 'https://schoolmenukr.ml/api';

request.post(url, body, (request, res) => {
  console.log(res.body);
});
</pre>

### 응답
 <pre>
[
    ...,
    {
        date:"1",
        breakfast:["찹쌀밥","홍합미역국5.6.","닭갈비5.6.13.","김구이13.","배추김치9.13.","방울토마토12."],
        lunch:["흑미밥","콩나물국5.13.","돼지등뼈김치찜9.10.13.","도토리묵무침5.6.13.","총각김치9.13.","청포도"],
        dinner:["찹쌀밥","오징어짬뽕국5.6.","배추겉절이13.","포도쥬스5.13.","만두오꼬노미야끼1.5.6.10.12.13."]
    },
    ...
];
 </pre>