import { SchoolInfo } from "../type/SchoolInfo";
import { Crawler, DataAccessor } from "@school-api/common";
import { SchoolInfoDataAccessor } from "../data/SchoolInfoDataAccessor";

export class SchoolInfoService {

    crawler: Crawler<SchoolInfo[]>;
    dataAccessor: SchoolInfoDataAccessor;

    constructor(
        crawler: Crawler<SchoolInfo[]>, 
        dataAccessor: SchoolInfoDataAccessor
    ) {
        this.crawler = crawler;
        this.dataAccessor = dataAccessor;
    }

    async getSchoolInfos(searchKeyword: string) {
        let result = await this.dataAccessor.getByKeyword();

        if (result.length === 0) {
            result = await this.crawler.get();
            await this.dataAccessor.updateDatasAndKeywords(result, searchKeyword);
        }

        return result;
    }
}