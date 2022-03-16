import { DataAccessor } from '@school-api/common'
import { SchoolInfo } from '../type/SchoolInfo'
import { firestore } from 'firebase-admin'
import { SchoolInfoAccessorQuery } from '../type/parameters'

const collectionName = 'schoolinfo'

export class SchoolInfoDataAccessor implements DataAccessor<SchoolInfoAccessorQuery, SchoolInfo[]> {
    readonly #db: firestore.Firestore
    readonly #ref: firestore.CollectionReference
    readonly #batch: firestore.WriteBatch

    constructor (db: firestore.Firestore) {
      this.#db = db
      this.#batch = this.#db.batch()
      this.#ref = this.#db.collection(collectionName)
    }

    async #getByKeyword (searchKeyword: string): Promise<SchoolInfo[]> {
      return this.#ref
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

    get (schoolInfoAccessorQuery: SchoolInfoAccessorQuery): Promise<SchoolInfo[]> {
      return this.#getByKeyword(schoolInfoAccessorQuery.searchKeyword)
    }

    /**
     * 외부 데이터와 내부 데이터를 비교하여 내부 데이터를 업데이트
     * @param neisFetched 외부에서 가져온 데이터
     * @param searchKeyword 사용자가 질의한 검색 키워드
     */
    put ({ neisFetched, searchKeyword }: {
      neisFetched: SchoolInfo[],
      searchKeyword: string,
    }) {
      const refs = neisFetched.map(data => this.#ref.doc(data.code))

      return this.#db.runTransaction(
        t => t.getAll(...refs)
          .then(docs => docs.filter(doc => doc.exists))
          .then(docs => docs.map(doc => doc.data()))
          .then((dbDatas: SchoolInfo[]) => {
            const fetchedCodes = neisFetched.map(data => data.code) // 외부 데이터의 NEIS코드
            const storedCodes = dbDatas.map(data => data.code) // 내부 데이터의 NEIS코드

            fetchedCodes.forEach(fc => {
              const doc = this.#ref.doc(fc)
              if (storedCodes.includes(fc)) { // 외부 데이터 코드에 내부 데이터가 있는지 확인
                // 있다면 검색 결과 개선을 위해 키워드 추가 (내부 데이터가 있었으나 키워드에 걸리지 않은 경우)
                t.update(doc, {
                  keywords: firestore.FieldValue.arrayUnion(searchKeyword)
                })
              } else {
                // 없다면 데이터 추가 (내부 데이터가 실제로 없는 경우)
                t.create(doc, {
                  ...neisFetched.find(d => d.code === fc),
                  keywords: [searchKeyword]
                })
              }
            })
          })
      )
    }

    close () {
      this.#db.terminate()
    }
}
