import { NeisCrawler } from '../src/data/NeisCrawler'
import { MenuDataAccessor } from '../src/data/MenuDataAccessor'
import { SchoolMenuService } from '../src/service/SchoolMenuService'
import { SchoolType } from '@school-api/common'
import { strictEqual } from 'assert'
import * as admin from 'firebase-admin'

const firebase = admin.initializeApp()

describe('[SCHOOL-MENU] Service', function () {
  const firestore = firebase.firestore()
  firestore.settings({
    host: 'localhost',
    port: 8080
  })

  it('fetches menus from NEIS or database properly', async () => {
    const neisCrawler = new NeisCrawler()
    const firestoreAccessor = new MenuDataAccessor(firestore)

    const schoolMenuService = new SchoolMenuService(neisCrawler, firestoreAccessor)

    const parameter = {
      schoolType: SchoolType.HIGH,
      schoolCode: 'K100000460',
      menuYear: 2020,
      menuMonth: 1
    }

    await schoolMenuService.getSchoolMenu(parameter)
    strictEqual(schoolMenuService.checkIfMenuIsFetchedFromDB(), false)

    await schoolMenuService.getSchoolMenu(parameter)
    strictEqual(schoolMenuService.checkIfMenuIsFetchedFromDB(), true)
  })

  it('fetches menus from NEIS or database properly', async () => {
    const neisCrawler = new NeisCrawler()
    const firestoreAccessor = new MenuDataAccessor(firestore)

    const schoolMenuService = new SchoolMenuService(neisCrawler, firestoreAccessor)

    const parameter = {
      schoolType: SchoolType.HIGH,
      schoolCode: 'N100000191',
      menuYear: 2021,
      menuMonth: 12
    }

    await schoolMenuService.getSchoolMenu(parameter)
    strictEqual(schoolMenuService.checkIfMenuIsFetchedFromDB(), false)

    await schoolMenuService.getSchoolMenu(parameter)
    strictEqual(schoolMenuService.checkIfMenuIsFetchedFromDB(), true)
  })
})
