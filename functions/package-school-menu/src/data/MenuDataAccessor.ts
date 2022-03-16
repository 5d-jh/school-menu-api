import { DataAccessor } from '@school-api/common'
import { SchoolMenu } from '../type/SchoolMenu'
import { firestore } from 'firebase-admin'
import { MenuDataAccessorQuery } from '../type/parameters'

const collectionName = 'schoolmenu'

export class MenuDataAccessor implements DataAccessor<MenuDataAccessorQuery, SchoolMenu[]> {
    private db: firestore.Firestore;
    private ref: firestore.CollectionReference;

    private schoolCode: string;
    private menuYear: number;
    private menuMonth: number;

    constructor (db: firestore.Firestore) {
      this.db = db
      this.ref = this.db.collection(collectionName)
    }

    async get (queryParameter: MenuDataAccessorQuery): Promise<SchoolMenu[] | null> {
      const snapshots = await this.ref
        .where('schoolCode', '==', queryParameter.schoolCode)
        .where('menuYear', '==', queryParameter.menuYear)
        .where('menuMonth', '==', queryParameter.menuMonth)
        .get()

      if (snapshots.docs.length === 0) {
        return null
      }

      return snapshots.docs[0].data().menu as SchoolMenu[]
    }

    async put (menu: SchoolMenu[]): Promise<void> {
      await this.ref.doc().set({
        menu,
        version: 2,
        schoolCode: this.schoolCode,
        menuYear: this.menuYear,
        menuMonth: this.menuMonth
      })
    }
}
