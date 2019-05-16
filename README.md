# 학교식단 API
## 향후 계획
- [ ] AWS -> ~Firebase~Azure로 플랫폼 이동
- [ ] 도메인 변경

## 개요 및 특징
GET 요청을 통해 학교 식단을 JSON으로 받아 어떤 플랫폼에서든 쉽게 불러올 수 있습니다.
[school-api](https://github.com/agemor/school-api) 프로젝트가 제작에 큰 도움이 되었습니다.

식단을 한 번 이상 요청 시 요청한 학교, 년, 월별로 식단이 서버에 저장되어 응답 속도가 대폭 개선됩니다.

초등학교, 중학교, 고등학교를 지원합니다.

## 학교 유형
 * 초등학교 <code>elementary</code>
 * 중학교 <code>middle</code>
 * 고등학교 <code>high</code>

## 학교 코드
[여기](http://code.schoolmenukr.ml/)에서 학교 코드를 확인할 수 있습니다.

## 식단 불러오기
<code>https://<span></span>schoolmenukr.<span></span>ml/api/[학교유형]/[학교코드]</code>로 현재 달의 식단을 불러올 수 있습니다. 응답 데이터는 JSON 입니다.

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

## 기타 사항
### 실행을 위한 추가 작업
 프로젝트 내에 다음 파일들이 있어야 합니다. 파일명, 파일 구조는 다음 예제와 동일해야 합니다.

#### serverMessage.json
 * 파일명: serverMessage.json
 * 설명: 공지사항을 저장하는 파일입니다.
 * 위치: /api
 * 예시: 
```json
{
    "content": ["foo", "bar", ...]
}
 ```

식단 임시 저장을 위해 다음 이름을 가진 AWS S3 버킷을 생성해야 합니다.
 * <code>school-menu-api-dev</code>: NODE_ENV=development 환경에서 사용할 버킷입니다.
 * <code>school-menu-api-caches</code>: NODE_ENV=production 환경에서 사용할 버킷입니다.


서버리스가 아닌 일반 환경에서 실행하고 싶으시다면, <code>app.local.js</code>를 실행합니다.

### 저작권
해당 소스를 마음대로 수정하거나 재배포 할 수 있습니다. [자세한 정보](https://namu.wiki/w/MIT%20허가서)
