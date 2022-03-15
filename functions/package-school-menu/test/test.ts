import { NeisCrawler } from '../src/data/NeisCrawler'
import { MenuDataAccessor } from '../src/data/MenuDataAccessor'
import { SchoolMenuService } from '../src/service/SchoolMenuService'
import { SchoolType } from '@school-api/common'
import { notEqual, strictEqual } from 'assert'
import { QueryStringOptions } from './type/QueryStringOptions'
import { initializeApp } from 'firebase-admin'

const firebase = initializeApp({
  databaseURL: 'http://localhost:8080',
  projectId: 'dummy-firestore-id'
})

console.log(`Database URL: ${firebase.options.databaseURL}`)

describe('[SCHOOL-MENU] Service', function () {
  this.timeout(50000)

  const db = firebase.firestore()

  it('fetches menus from NEIS or database properly', (done) => {
    const neisCrawler = new NeisCrawler()
      .setParameters(SchoolType.HIGH, 'K100000460', 2020, 1)

    const firestoreAccessor = new MenuDataAccessor(db)
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

    const firestoreAccessor = new MenuDataAccessor(db)
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
