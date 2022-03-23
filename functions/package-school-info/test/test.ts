import { NeisCrawler } from '../src/data/NeisCrawler'
import { SchoolInfoDataAccessor } from '../src/data/SchoolInfoDataAccessor'
import { SchoolInfoService } from '../src/service/SchoolInfoService'
import { notStrictEqual } from 'assert'
import * as admin from 'firebase-admin'

const firebase = admin.initializeApp()

const firestore = firebase.firestore()
firestore.settings({
  host: 'localhost',
  port: 8080
})

describe('[SCHOOL-INFO] School info parser', function () {
  it('parses text from school info', async () => {
    const neisCrawler = new NeisCrawler()

    const data = await neisCrawler.get({ searchKeyword: '서울' })
    notStrictEqual(data.length, 0)
  })
})

describe('[SCHOOL-INFO] School info service', function () {
  it('saves keywords or datas', function (done) {
    const searchKeyword = '서울'

    const neisCrawler = new NeisCrawler()
    const schoolInfoDataAccessor = new SchoolInfoDataAccessor(firestore)

    const schoolInfoService = new SchoolInfoService(neisCrawler, schoolInfoDataAccessor)

    schoolInfoService.getSchoolInfos({ searchKeyword })
      .then(data => {
        notStrictEqual(data.length, 0)
      })
      .then(done)
  })
})
