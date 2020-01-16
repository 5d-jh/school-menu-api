# 학교식단 API 
http://www.schoolmenukr.ml/api/
[![Build Status](https://travis-ci.org/5d-jh/school-menu-api.svg?branch=master)](https://travis-ci.org/5d-jh/school-menu-api)

## 개요 및 특징
[HTTP GET 요청](https://opentutorials.org/course/3385/21674)을 통해 학교 식단을 [JSON](https://opentutorials.org/course/1375/6844)으로 받아 어떤 플랫폼에서든 쉽게 불러올 수 있습니다.
[school-api](https://github.com/agemor/school-api) 프로젝트가 제작에 큰 도움이 되었습니다.

식단을 한 번 이상 요청 시 요청한 학교, 년, 월별로 식단이 서버에 저장되어 응답 속도가 대폭 개선됩니다.

초등학교, 중학교, 고등학교를 지원합니다.

## 학교 유형
 * 초등학교 <code>elementary</code>
 * 중학교 <code>middle</code>
 * 고등학교 <code>high</code>

## 학교 코드
[여기](http://www.schoolcodekr.ml/app)에서 학교 코드를 확인할 수 있습니다.

## 식단 불러오기
`https://schoolmenukr.ml/api/[학교유형]/[학교코드]`로 현재 달의 식단을 불러올 수 있습니다. 응답 데이터는 JSON 입니다.

### 매개변수(선택사항)
다음과 같이 주소 끝에 변수명과 값을 적어 사용합니다.

<code>https://<span></span>schoolmenukr.<span></span>ml/api/[학교유형]/[학교코드]<strong>?[변수명1]=[값1]&[변수명2]=[값2]</strong></code>

| 변수명 | 설명 | 기본값 |
| :------: | ------ | ------ |
| year | 특정한 년도를 지정하여 해당 년도에 해당하는 식단을 불러옵니다. | 현재 날짜의 연도 | 
| month | 특정한 달을 지정하여 해당 달에 해당하는 식단을 불러옵니다. | 현재 날짜의 월 |
| date | 특정한 일을 지정하여 해당 날짜에 해당하는 식단을 불러옵니다. | 현재 날짜의 일 |
| hideAllergy | true로 설정 시 알레르기 정보를 감춥니다. | <code>false</code> |

## 예시
 > Node.js
```javascript
const request = require('request');

const url = 'https://schoolmenukr.ml/api/high/X123456789?date=23';
request(url, (err, res, body) => {
    var json = JSON.parse(body);
    console.log(json);
});
```
 > Python
```python
import requests
import json

url = 'https://schoolmenukr.ml/api/middle/X123456789?year=2018&month=5'
response = requests.get(url)
school_menu = json.loads(response.text)
print(school_menu)
```

### 응답
```
{
    menu: [
        ...,
        {
            date:"5",
            breakfast:["찹쌀밥","홍합미역국5.6.","닭갈비5.6.13.","김구이13.","배추김치9.13.","방울토마토12."],
            lunch:["흑미밥","콩나물국5.13.","돼지등뼈김치찜9.10.13.","도토리묵무침5.6.13.","총각김치9.13.","청포도"],
            dinner:["찹쌀밥","오징어짬뽕국5.6.","배추겉절이13.","포도쥬스5.13.","만두오꼬노미야끼1.5.6.10.12.13."]
        },
        ...
    ],
    server_message: ["foo", "bar", ...]
}
```

# 학교 정보 API
## 정보 불러오기
`https://schoolmenukr.ml/neis?q=[검색키워드]`로 현재 달의 식단을 불러올 수 있습니다. 응답 데이터는 JSON 입니다.

## 예시
```python
import requests
import json
url = 'https://www.schoolmenukr.ml/api?q=한국학교'
response = requests.get(url)
school_infos = json.loads(response.text)
print(school_infos)
```

## 응답
```json
{
    "school_infos": [
        {
            "code": "X123456789",
            "address": "서울시...",
            "name": "OO학교",
            "type": "elementary"
        }, {
            "code": "X987654321",
            "address": "부산시...",
            "name": "XX학교",
            "type": "middle"
        }
    ],
    "server_message": {
        "all_loaded": true
    }
}
```

### 응답 정의
|아이템|설명|데이터 설명|
|:--:|:--:|:--:|
|`school_infos.type`|학교 종류|`elementary`, `middle`, `high`, `special` 중 하나인 문자열입니다.|
|`school_infos.code`|NEIS 코드|첫 자리가 알파벳이고 나머지가 숫자인 열 자리 문자열입니다.|
|`school_infos.address`|학교 주소|학교의 소재지입니다.|
|`school_infos.name`|학교 이름|학교의 이름입니다.|
|`server_message.all_loaded`|전부 다 불러왔는지 여부|학교 정보가 `school_infos`에 있는 것이 전부라면 `true`, 아니면 `false` 입니다.|

elementary는 초등학교, middle은 중학교, high는 고등학교, special은 특수학교 입니다.
