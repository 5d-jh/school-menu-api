import { DataAccessor } from '@school-api/common'
import { SchoolMenu } from '../type/SchoolMenu'
import { firestore } from 'firebase-admin'
import { SchoolMenuIdentifier } from '../type/parameter'

const collectionName = 'schoolmenu'

export class MenuDataAccessor implements DataAccessor<SchoolMenu[]> {
    private db: firestore.Firestore;
    private ref: firestore.CollectionReference;

    constructor (db: firestore.Firestore) {
      this.db = db
      this.ref = this.db.collection(collectionName)
    }

    async get (identifier: SchoolMenuIdentifier): Promise<SchoolMenu[]> {
      const snapshots = await this.ref
        .where('schoolCode', '==', identifier.schoolCode)
        .where('menuYear', '==', identifier.menuYear)
        .where('menuMonth', '==', identifier.menuMonth)
        .get()

      if (snapshots.docs.length === 0) {
        return null
      }

      return snapshots.docs[0].data().menu as SchoolMenu[]
    }

    async put (identifier: SchoolMenuIdentifier, menu: SchoolMenu[]) {
      return await this.ref.doc().set({
        menu,
        version: 2,
        schoolCode: identifier.schoolCode,
        menuYear: identifier.menuYear,
        menuMonth: identifier.menuMonth
      })
    }
}
