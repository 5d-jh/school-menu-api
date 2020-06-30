import { NeisCrawler } from "../src/data/NeisCrawler";
import { SchoolInfoDataAccessor } from "../src/data/SchoolInfoDataAccessor";
import { SchoolInfoService } from "../src/service/SchoolInfoService";
import admin from "firebase-admin";

admin.initializeApp({
    databaseURL: "localhost:8080"
});

describe("[SCHOOL-INFO] School info parser", function() {

    this.timeout(50000);

    it('parses text from school info', (done) => {
        const neisCrawler = new NeisCrawler();
        neisCrawler.get()
            .then(() => done());
    });
});

describe("[SCHOOL-INFO] School info service", function() {

    this.timeout(50000);

    it("saves keywords or datas", (done) => {
        const searchKeyword = "서울";

        const neisCrawler = new NeisCrawler().setParameters(searchKeyword);
        const schoolInfoDataAccessor = new SchoolInfoDataAccessor(admin.firestore());
        const schoolInfoService = new SchoolInfoService(neisCrawler, schoolInfoDataAccessor);

        schoolInfoService.getSchoolInfos(searchKeyword)
            .then(() => done());
    })
})