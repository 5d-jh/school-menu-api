import { ReadOnlyDataAccessor } from '@school-api/common'
import { SchoolInfo, StringToKeyMapping } from '../type/SchoolInfo'
import fetch from 'node-fetch'
import { URLSearchParams } from 'url'
import { JSDOM } from 'jsdom'
import { decode } from 'iconv-lite'

import { env } from 'process'
import { NeisCrawlerQuery } from '../type/parameters'

env.NODE_TLS_REJECT_UNAUTHORIZED = '0'

export class NeisCrawler implements ReadOnlyDataAccessor<NeisCrawlerQuery, SchoolInfo[]> {
    private contentLength: number;

    async #getSchoolCodes (neisCrawlerQuery: NeisCrawlerQuery): Promise<string[]> {
      const options = {
        method: 'POST',
        body: new URLSearchParams({
          SEARCH_GS_HANGMOK_CD: '',
          SEARCH_GS_HANGMOK_NM: '',
          SEARCH_SCHUL_NM: neisCrawlerQuery.searchKeyword,
          SEARCH_GS_BURYU_CD: '',
          SEARCH_SIGUNGU: '',
          SEARCH_SIDO: '',
          SEARCH_FOND_SC_CODE: '',
          SEARCH_MODE: '9',
          SEARCH_TYPE: '2',
          pageNumber: '1',
          SEARCH_KEYWORD: neisCrawlerQuery.searchKeyword
        })
      }
      const url = 'https://www.schoolinfo.go.kr/ei/ss/Pneiss_f01_l0.do'
      const body = await fetch(url, options)
        .then(res => res.buffer())
        .then(buffer => decode(buffer, 'euc-kr'))

      const { window } = new JSDOM(body.toString())
      const $ = require('jquery')(window)

      const schoolCodes: string[] = []
      $('.basicInfo').forEach(function () {
        schoolCodes.push($(this).attr('class').split(' ')[1].slice(2))
      })

      return schoolCodes
    }

    async #getSchoolInfos (schoolCodes: string[]): Promise<SchoolInfo[]> {
      const result = []

      for (const i in schoolCodes) {
        const code = schoolCodes[i]

        const body = await fetch(`https://www.schoolinfo.go.kr/ei/ss/Pneiss_b01_s0.do?VIEWMODE=2&PRE_JG_YEAR=&HG_CD=${code}&GS_HANGMOK_CD=`)
          .then(res => res.buffer())
          .then(buffer => decode(buffer, 'euc-kr'))

        const { window } = new JSDOM(body)
        const $ = require('jquery')(window)

        const name = $('a').first().text()

        const info = <SchoolInfo>{ name, code }

        $('.md').forEach(function () {
          const str = $(this).children('.mt').text().slice(0, -2)
          const key = StringToKeyMapping[str]
          const val = $(this).text().replace(/(\n|\t)/g, '').slice(str.length + 2).trim()

          if (key === 'estDate') {
            const date = val.split(' ').map(str => str.replace(/[^0-9]/g, ''))
            info[key] = {
              y: date[0],
              m: date[1],
              d: date[2]
            }
          } else if (key) {
            info[key] = val
          }
        })

        result.push(info)
      }

      return result
    }

    async get (neisCrawlerQuery: NeisCrawlerQuery): Promise<SchoolInfo[]> {
      return this.#getSchoolCodes(neisCrawlerQuery)
        .then(this.#getSchoolInfos)
    }

    closeConnection (): any {} // no op

    shouldSave () {
      return this.contentLength !== 0
    }
}
