import { Crawler, SchoolType, BadRequestError } from '@school-api/common'
import { SchoolMenu } from '../type/SchoolMenu'
import { JSDOM } from 'jsdom'
import fetch, { FetchError } from 'node-fetch'
import { decodeHTML5 } from 'entities'
import { env } from 'process'

export class NeisCrawler implements Crawler<SchoolMenu[]> {
    private schoolType: SchoolType;
    private schoolCode: string;
    private menuYear: number;
    private menuMonth: number;
    private schoolRegion: string;

    private hasNoData: boolean;

    setParameters (schoolType: SchoolType, schoolCode: string, menuYear: number, menuMonth: number): Crawler<SchoolMenu[]> {
      this.schoolType = schoolType
      this.schoolCode = schoolCode
      this.menuYear = menuYear
      this.menuMonth = menuMonth

      if (schoolCode[0] === 'A') {
        // 국립 고등학교
        this.schoolRegion = {
          A000003488: 'kwe',
          A000003490: 'dge',
          A000003495: 'gne',
          A000003496: 'cne',
          A000003509: 'pen',
          A000003561: 'sen',
          A000003516: 'gen',
          A000003520: 'jbe',
          A000003566: 'jje',
          A000003569: 'cbe'
        }[schoolCode]
      } else {
        this.schoolRegion = {
          B: 'sen',
          E: 'ice',
          C: 'pen',
          F: 'gen',
          G: 'dje',
          D: 'dge',
          I: 'sje',
          H: 'use',
          J: 'goe',
          K: 'kwe',
          M: 'cbe',
          N: 'cne',
          R: 'gbe',
          S: 'gne',
          P: 'jbe',
          Q: 'jne',
          T: 'jje'
        }[schoolCode[0]]
      }

      return this
    }

    private async fetch (url = `https://stu.${this.schoolRegion}.go.kr/sts_sci_md00_001.do`): Promise<SchoolMenu[]> {
      url += `?schulCode=${this.schoolCode}`
      url += `&schulCrseScCode=${this.schoolType}`
      url += `&ay=${this.menuYear}`
      url += `&mm=${this.menuMonth < 10 ? '0' + this.menuMonth.toString() : this.menuMonth}`

      if (env.NODE_ENV === 'test') {
        console.log(url)
      }

      try {
        const body = await fetch(url)
          .then(res => res.text())

        const { window } = new JSDOM(body.toString())
        const $ = require('jquery')(window)

        if (env.NODE_ENV !== 'production') {
          console.log(url)
        }

        const result: SchoolMenu[] = []
        let hasNoData = true

        $('td div').each(function () {
          const text = decodeHTML5($(this).html())

          const date = text.split(/\[조식\]|\[중식\]|\[석식\]/)[0].replace('<br>', '').trim()
          /*
                    [예시]
                    '3 <br>[중식]고등어' =(1)=> '3 <br>' =(2)=> '3 ' =(3)=> '3'
                    [설명]
                    (1) 텍스트 '[조식]' 또는 '[중식]' 또는 '[석식]' 중 하나를 기준으로 나눈 배열의 첫 번째 원소를 고름
                    (2) 첫 번째 원소의 <br> 태그를 제거함
                    (3) 문자의 공백을 제거함
                    */
          if (date/* 날짜 정보가 있는 경우에만 배열에 식단을 저장함 */) {
            const breakfast = /\[조식\](.*?)(\[|$)/g.exec(text) && /\[조식\](.*?)(\[|$)/g.exec(text)[1]
            /*
                        [예시]
                        '[조식]고등어<br>참치[' => '고등어<br>참치'
                        [설명]
                        * 텍스트 '[조식]'과 '[' 사이에 있는 모든 텍스트를 저장함
                        * RegExp.prototype.exec()의 첫 번째 원소에는 '[조식]'과 '['가 포함된 일치된 문자열이지만, 두 번째 원소는 두 텍스트가 제외됨
                        - 자세한 사향은 해당 링크 참조: https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/RegExp/exec
                        */
            const lunch = /\[중식\](.*?)(\[|$)/g.exec(text) && /\[중식\](.*?)(\[|$)/g.exec(text)[1]
            const dinner = text.match(/\[석식\](.*)/) && text.match(/\[석식\](.*)/)[1]
            /*
                        [설명]
                        * 텍스트 '[석식]' 뒤에 있는 모든 텍스트를 저장함.
                        */

            result.push({
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
              dinner: dinner ? dinner.split('<br>').filter(menu => menu) : []
            })

            if (hasNoData) {
              hasNoData = !(breakfast || lunch || dinner)
            }
          }
        })

        this.hasNoData = hasNoData

        return result
      } catch (error) {
        const { hostname } = new URL(url)
        if (error instanceof FetchError && hostname !== `stu.${this.schoolRegion}.go.kr`) {
          return this.fetch(`https://stu.${this.schoolRegion}.go.kr/sts_sci_md00_001.do`)
        }
        throw error
      }
    }

    shouldSave () {
      return !this.hasNoData
    }

    async get (): Promise<SchoolMenu[]> {
      if (!this.schoolRegion) {
        throw new BadRequestError('존재하지 않는 지역입니다. 학교 코드 첫 번째 자리를 다시 확인해 주세요.')
      }

      if (this.menuMonth < 0) {
        throw new BadRequestError('지정한 월이 유효하지 않습니다.')
      }

      return await this.fetch()
    }
}
