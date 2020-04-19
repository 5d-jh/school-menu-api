import { NeisCrawler } from "../src/data/NeisCrawler";
import { FirestoreAccessor } from "../src/data/FirestoreAccessor";
import { SchoolMenuService } from "../src/service/SchoolMenuService";
import { SchoolType } from "package-common";
import { notEqual } from "assert";
import { QueryStringOptions } from "./type/QueryStringOptions";
import {  } from "firebase-admin";

describe("[SCHOOL-MENU] Service", function () {

    this.timeout(10000);

    it("Fetches menus from NEIS or database properly", (done) => {
        const neisCrawler = new NeisCrawler(SchoolType.HIGH, "K100000460", 2020, 1);
        const firestoreAccessor = new FirestoreAccessor("K100000460", 2020, 1);
        const schoolMenuService = new SchoolMenuService(neisCrawler, firestoreAccessor);

        schoolMenuService.getSchoolMenu({} as QueryStringOptions)
            .then(menu => {
                notEqual(menu, null);
                notEqual(schoolMenuService.checkIfMenuIsFetchedFromDB(), null);
                console.log(menu);
                done();
            });
    });
});