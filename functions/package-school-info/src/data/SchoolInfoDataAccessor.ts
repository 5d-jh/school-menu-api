import { DataAccessor, InternalServerError } from '@school-api/common'
import { SchoolInfo } from '../type/SchoolInfo'
import { firestore } from 'firebase-admin'

const collectionName = 'schoolinfo'

export class SchoolInfoDataAccessor implements DataAccessor<SchoolInfo[]> {
    private db: firestore.Firestore;
    private ref: firestore.CollectionReference;
    private batch: firestore.WriteBatch;

    constructor (db: firestore.Firestore) {
      this.db = db
      this.batch = this.db.batch()
      this.ref = this.db.collection(collectionName)
    }

    setParameters (): DataAccessor<SchoolInfo[]> {
      return this
    }

    async getManyByCodes (codes: string[]): Promise<SchoolInfo[]> {
      const refs = codes.map(code => this.ref.doc(code))
      return this.db.getAll(...refs)
        .then(docs => docs.map(doc => doc.data()))
        .then(datas => datas as SchoolInfo[])
    }

    async getByKeyword (searchKeyword: string): Promise<SchoolInfo[]> {
      return this.ref
        .where('keywords', 'array-contains', searchKeyword)
        .get()
        .then(({ docs }) => docs.map(doc => doc.data()))
        .then(
          data => data.map(
            schoolInfo => {
              delete schoolInfo.keywords
              return schoolInfo as SchoolInfo
            }
          )
        )
    }

    /**
     * 외부 데이터와 내부 데이터를 비교하여 내부 데이터를 업데이트
     * @param fetchedDatas 외부에서 가져온 데이터
     * @param keyword 사용자가 검색한 키워드(검색 결과 개선을 위해 사용)
     */
    updateDatasAndKeywords (fetchedDatas: SchoolInfo[], keyword: string) {
      const refs = fetchedDatas.map(data => this.ref.doc(data.code))

      return this.db.runTransaction(
        t => t.getAll(...refs)
          .then(docs => docs.filter(doc => doc.exists))
          .then(docs => docs.map(doc => doc.data()))
          .then((dbDatas: SchoolInfo[]) => {
            const fetchedCodes = fetchedDatas.map(data => data.code) // 외부 데이터의 NEIS코드
            const storedCodes = dbDatas.map(data => data.code) // 내부 데이터의 NEIS코드

            fetchedCodes.forEach(fc => {
              const doc = this.ref.doc(fc)
              if (storedCodes.includes(fc)) { // 외부 데이터 코드에 내부 데이터가 있는지 확인
                // 있다면 검색 결과 개선을 위해 키워드 추가 (내부 데이터가 있었으나 키워드에 걸리지 않은 경우)
                t.update(doc, {
                  keywords: firestore.FieldValue.arrayUnion(keyword)
                })
              } else {
                // 없다면 데이터 추가 (내부 데이터가 실제로 없는 경우)
                t.create(doc, {
                  ...fetchedDatas.find(d => d.code === fc),
                  keywords: [keyword]
                })
              }
            })
          })
      )
    }

    updateMany (datas: SchoolInfo[], merge?: boolean) {
      datas.forEach(data => this.batch.set(this.ref.doc(data.code), data, { merge }))
      return this.batch.commit()
    }

    close () {
      this.db.terminate()
    }
}
