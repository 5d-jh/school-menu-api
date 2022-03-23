import { DataAccessor } from '@school-api/common'
import { SchoolInfo, SchoolInfoSearchQuery } from '../type/SchoolInfo'
import { firestore } from 'firebase-admin'

const collectionName = 'schoolinfo'

export class SchoolInfoDataAccessor implements DataAccessor<SchoolInfo[]> {
    readonly #firestore: firestore.Firestore;
    readonly #collectionReference: firestore.CollectionReference;

    constructor (db: firestore.Firestore) {
      this.#firestore = db
      this.#collectionReference = this.#firestore.collection(collectionName)
    }

    async getByKeyword (query: SchoolInfoSearchQuery): Promise<SchoolInfo[]> {
      return this.#collectionReference
        .where('keywords', 'array-contains', query.searchKeyword)
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
     * @param fetchedData 외부에서 가져온 데이터
     * @param query 사용자가 검색한 키워드(검색 결과 개선을 위해 사용)
     */
    updateKeywordOrInsert (fetchedData: SchoolInfo[], query: Readonly<SchoolInfoSearchQuery>) {
      const refs = fetchedData.map(data => this.#collectionReference.doc(data.code))

      return this.#firestore.runTransaction(
        t => t.getAll(...refs)
          .then(docs => docs.filter(doc => doc.exists))
          .then(docs => docs.map(doc => doc.data()))
          .then((dbDatas: SchoolInfo[]) => {
            const fetchedCodes = fetchedData.map(data => data.code) // 외부 데이터의 NEIS코드
            const storedCodes = dbDatas.map(data => data.code) // 내부 데이터의 NEIS코드

            fetchedCodes.forEach(fc => {
              const doc = this.#collectionReference.doc(fc)
              if (storedCodes.includes(fc)) { // 외부 데이터 코드에 내부 데이터가 있는지 확인
                // 있다면 검색 결과 개선을 위해 키워드 추가 (내부 데이터가 있었으나 키워드에 걸리지 않은 경우)
                t.update(doc, {
                  keywords: firestore.FieldValue.arrayUnion(query.searchKeyword)
                })
              } else {
                // 없다면 데이터 추가 (내부 데이터가 실제로 없는 경우)
                t.create(doc, {
                  ...fetchedData.find(d => d.code === fc),
                  keywords: [query.searchKeyword]
                })
              }
            })
          })
      )
    }
}
