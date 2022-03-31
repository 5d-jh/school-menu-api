const fetchMockJest = require('fetch-mock-jest')
const fs = require('fs')
const path = require('path')

jest.mock(
  'node-fetch',
  () => fetchMockJest.sandbox()
    .get(/https:\/\/stu.(.*).go.kr\/(.*)/, (url, options) => {
      const parsed = new URL(url)

      const schoolRegion = parsed.host.split('.')[1]
      const schoolCode = parsed.searchParams.get('schulCode')
      const menuYear = parsed.searchParams.get('ay')
      const menuMonth = parsed.searchParams.get('mm')

      const siteDir = path.resolve(__dirname, `./sites/stu.go.kr/${schoolRegion}_${schoolCode}_${menuYear}_${menuMonth}.html`)

      return {
        body: fs.readFileSync(siteDir).toString(),
        headers: {
          'Content-Type': 'text/html; charset=UTF-8'
        }
      }
    })
    .post(/https:\/\/www.schoolinfo.go.kr\/(.*)/, (url, options) => {
      const siteDir = path.resolve(__dirname, `./sites/schoolinfo.go.kr/keywords/${options.body.get('SEARCH_KEYWORD')}.html`)

      return {
        body: fs.readFileSync(siteDir).toString(),
        headers: {
          'Content-Type': 'text/html; charset=EUC-KR'
        }
      }
    })
    .get(/https:\/\/www.schoolinfo.go.kr\/(.*)/, (url, options) => {
      const siteDir = path.resolve(__dirname, './sites/schoolinfo.go.kr/details.html')

      return {
        body: fs.readFileSync(siteDir).toString(),
        headers: {
          'Content-Type': 'text/html; charset=EUC-KR'
        }
      }
    })
)
