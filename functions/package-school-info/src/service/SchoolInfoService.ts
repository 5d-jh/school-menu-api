import { SchoolInfo } from "../type/SchoolInfo";
import { Crawler } from "@school-api/common";
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

    async getSchoolInfos(searchKeyword: string): Promise<SchoolInfo[]> {
        let result = await this.dataAccessor.getByKeyword(searchKeyword);

        if (result.length === 0) {
            result = await this.crawler.get();
            await this.dataAccessor.updateDatasAndKeywords(result, searchKeyword);
        }

        return result;
    }
}