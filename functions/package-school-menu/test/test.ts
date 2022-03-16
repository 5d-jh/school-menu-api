import { NeisCrawler } from '../src/data/NeisCrawler'
import { MenuDataAccessor } from '../src/data/MenuDataAccessor'
import { SchoolMenuService } from '../src/service/SchoolMenuService'
import { SchoolType } from '@school-api/common'
import { notEqual, strictEqual } from 'assert'
import * as admin from 'firebase-admin'
import { SchoolMenuServiceParam } from '../src/type/parameters'

const firebase = admin.initializeApp({
  databaseURL: 'http://localhost:8080',
  projectId: 'dummy-firestore-id'
})

console.log(`Database URL: ${firebase.options.databaseURL}`)

describe('[SCHOOL-MENU] Service', function () {
  this.timeout(50000)

  const db = firebase.firestore()

  it('fetches menus from NEIS or database properly', async (done) => {
    const neisCrawler = new NeisCrawler()

    const firestoreAccessor = new MenuDataAccessor(db)

    const schoolMenuService = new SchoolMenuService(neisCrawler, firestoreAccessor)

    const query: SchoolMenuServiceParam = {
      schoolType: SchoolType.HIGH,
      schoolCode: 'K100000460',
      menuYear: 2020,
      menuMonth: 1
    }

    await schoolMenuService.getSchoolMenu(query)

    strictEqual(schoolMenuService.isMenuFromDB, false)

    const secondRequest = await schoolMenuService.getSchoolMenu(query)
    notEqual(secondRequest, null)
    strictEqual(schoolMenuService.isMenuFromDB, true)

    done()
  })

  it('fetches menus from NEIS or database properly on national school', async (done) => {
    const neisCrawler = new NeisCrawler()

    const firestoreAccessor = new MenuDataAccessor(db)

    const schoolMenuService = new SchoolMenuService(neisCrawler, firestoreAccessor)

    const query: SchoolMenuServiceParam = {
      schoolType: SchoolType.HIGH,
      schoolCode: 'N100000191',
      menuYear: 2020,
      menuMonth: 1
    }

    await schoolMenuService.getSchoolMenu(query)

    strictEqual(schoolMenuService.isMenuFromDB, false)

    const secondRequest = await schoolMenuService.getSchoolMenu(query)
    notEqual(secondRequest, null)
    strictEqual(schoolMenuService.isMenuFromDB, true)

    done()
  })
})
