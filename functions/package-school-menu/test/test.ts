import { NeisCrawler } from '../src/data/NeisCrawler'
import { MenuDataAccessor } from '../src/data/MenuDataAccessor'
import { SchoolMenuService } from '../src/service/SchoolMenuService'
import { SchoolType } from '@school-api/common'
import { notEqual, strictEqual } from 'assert'
import { QueryStringOptions } from '../src/type/QueryStringOptions'
import * as admin from 'firebase-admin'

const firebase = admin.initializeApp()

describe('[SCHOOL-MENU] Service', function () {
  const firestore = firebase.firestore()
  firestore.settings({
    host: 'localhost',
    port: 8080
  })

  it('fetches menus from NEIS or database properly', (done) => {
    const neisCrawler = new NeisCrawler()
      .setParameters(SchoolType.HIGH, 'K100000460', 2020, 1)

    const firestoreAccessor = new MenuDataAccessor(firestore)
      .setParameters('K100000460', 2020, 1)

    const schoolMenuService = new SchoolMenuService(neisCrawler, firestoreAccessor)

    schoolMenuService.getSchoolMenu({} as QueryStringOptions)
      .then(() => {
        strictEqual(schoolMenuService.checkIfMenuIsFetchedFromDB(), false)
        schoolMenuService.getSchoolMenu({} as QueryStringOptions)
          .then(menu => {
            notEqual(menu, null)
            strictEqual(schoolMenuService.checkIfMenuIsFetchedFromDB(), true)
            done()
          })
      })
  })

  it('fetches menus from NEIS or database properly', (done) => {
    const neisCrawler = new NeisCrawler()
      .setParameters(SchoolType.HIGH, 'N100000191', 2021, 12)

    const firestoreAccessor = new MenuDataAccessor(firestore)
      .setParameters('N100000191', 2021, 12)

    const schoolMenuService = new SchoolMenuService(neisCrawler, firestoreAccessor)

    schoolMenuService.getSchoolMenu({} as QueryStringOptions)
      .then(() => {
        strictEqual(schoolMenuService.checkIfMenuIsFetchedFromDB(), false)
        schoolMenuService.getSchoolMenu({} as QueryStringOptions)
          .then(menu => {
            notEqual(menu, null)
            strictEqual(schoolMenuService.checkIfMenuIsFetchedFromDB(), true)
            done()
          })
      })
  })
})
