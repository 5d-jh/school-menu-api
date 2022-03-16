import { SchoolInfo } from '../type/SchoolInfo'
import { DataAccessor, ReadOnlyDataAccessor } from '@school-api/common'
import { NeisCrawlerQuery, SchoolInfoAccessorQuery } from '../type/parameters'

export class SchoolInfoService {
    readonly #crawler: ReadOnlyDataAccessor<NeisCrawlerQuery, SchoolInfo[]>;
    readonly #dataAccessor: DataAccessor<SchoolInfoAccessorQuery, SchoolInfo[]>;

    constructor (
      crawler: ReadOnlyDataAccessor<NeisCrawlerQuery, SchoolInfo[]>,
      dataAccessor: DataAccessor<SchoolInfoAccessorQuery, SchoolInfo[]>
    ) {
      this.#crawler = crawler
      this.#dataAccessor = dataAccessor
    }

    async getSchoolInfos (searchKeyword: string): Promise<SchoolInfo[]> {
      let result = await this.#dataAccessor.get({ searchKeyword })

      if (result.length === 0) {
        result = await this.#crawler.get({ searchKeyword })

        if (result.length !== 0) {
          await this.#dataAccessor.put({ neisFetched: result, searchKeyword })
        }
      }

      return result
    }
}
