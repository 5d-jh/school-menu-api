# 학교식단 API
[![Build Status](https://travis-ci.org/5d-jh/school-menu-api.svg?branch=master)](https://travis-ci.org/5d-jh/school-menu-api)

## 개요 및 특징
**더욱 정확한 정보를 보장하는 [나이스 교육정보 개방포털](https://open.neis.go.kr/portal/mainPage.do) 사용을 권장합니다.**

[HTTP GET 요청](https://opentutorials.org/course/3385/21674)을 통해 학교 식단을 [JSON](https://opentutorials.org/course/1375/6844)으로 받아 어떤 플랫폼에서든 쉽게 불러올 수 있습니다.
[school-api](https://github.com/agemor/school-api) 프로젝트가 제작에 큰 도움이 되었습니다.

식단을 한 번 이상 요청 시 요청한 학교, 년, 월별로 식단이 서버에 저장되어 응답 속도가 대폭 개선됩니다.

초등학교, 중학교, 고등학교를 지원합니다.

## 학교 유형
 * 초등학교: `elementary`
 * 중학교: `middle`
 * 고등학교: `high`

## 학교 코드
[여기](https://schoolmenukr.ml/code/app)에서 학교 코드를 확인할 수 있습니다.

## 식단 불러오기
`https://schoolmenukr.ml/api/[학교유형]/[학교코드]`</code>`로 현재 달의 식단을 불러올 수 있습니다. 응답 데이터는 JSON 입니다.

### 매개변수(선택사항)
다음과 같이 주소 끝에 변수명과 값을 적어 사용합니다.

<code>https://<span></span>schoolmenukr.<span></span>ml/api/[학교유형]/[학교코드]<strong>?[변수명1]=[값1]&[변수명2]=[값2]</strong></code>

| 변수명 | 설명 | 기본값 |
| :------: | ------ | ------ |
| year | 특정한 년도를 지정하여 해당 년도에 해당하는 식단을 불러옵니다. | 현재 날짜의 연도 | 
| month | 특정한 달을 지정하여 해당 달에 해당하는 식단을 불러옵니다. | 현재 날짜의 월 |
| date | 특정한 일을 지정하여 해당 날짜에 해당하는 식단을 불러옵니다. | 현재 날짜의 일 |
| allergy | `hidden`으로 설정하면 알레르기 정보가 표시되지 않으며, `formed`로 설정하면 정보가 구조화되어 표시됩니다. | 없음 |

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

## 기타 사항
### 빌드 관련
`functions` 디렉토리 내에서 다음과 같이 명령어를 실행해야 빌드가 완료됩니다.
```sh
yarn
```
```sh
yarn run build
```

### 저작권
해당 프로젝트는 MIT 라이선스 하에 배포되며, 수정, 복제, 2차 창작, 영리적 사용, 다른 라이선스 하에 재배포 등이 가능합니다. 다만 해당 프로젝트와 관련된 피해에 대해 책임지지 않습니다.
