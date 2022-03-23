import { SchoolInfo, SchoolInfoSearchQuery } from '../type/SchoolInfo'
import { Crawler } from '@school-api/common'
import { SchoolInfoDataAccessor } from '../data/SchoolInfoDataAccessor'

export class SchoolInfoService {
    readonly #crawler: Crawler<SchoolInfo[], SchoolInfoSearchQuery>;
    readonly #dataAccessor: SchoolInfoDataAccessor;

    constructor (
      crawler: Crawler<SchoolInfo[], SchoolInfoSearchQuery>,
      dataAccessor: SchoolInfoDataAccessor
    ) {
      this.#crawler = crawler
      this.#dataAccessor = dataAccessor
    }

    async getSchoolInfos (query: SchoolInfoSearchQuery): Promise<SchoolInfo[]> {
      let result = await this.#dataAccessor.getByKeyword(query)

      if (result.length === 0) {
        result = await this.#crawler.get(query)

        if (result.length !== 0) {
          await this.#dataAccessor.updateKeywordOrInsert(result, query)
        }
      }

      return result
    }
}
