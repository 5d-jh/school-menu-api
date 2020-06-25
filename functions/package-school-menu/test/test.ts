import { NeisCrawler } from "../src/data/NeisCrawler";
import { MenuDataAccessor } from "./data/MenuDataAccessor";
import { SchoolMenuService } from "../src/service/SchoolMenuService";
import { SchoolType } from "package-common";
import { notEqual } from "assert";
import { QueryStringOptions } from "./type/QueryStringOptions";
import { initializeApp } from "firebase-admin";

initializeApp({
    databaseURL: "https://localhost:8080"
});

describe("[SCHOOL-MENU] Service", function () {

    this.timeout(50000);

    it("fetches menus from NEIS or database properly", (done) => {
        const neisCrawler = new NeisCrawler().setParameters(SchoolType.HIGH, "K100000460", 2020, 1);
        const firestoreAccessor = new MenuDataAccessor().setParameters("K100000460", 2020, 1);
        const schoolMenuService = new SchoolMenuService(neisCrawler, firestoreAccessor);

        schoolMenuService.getSchoolMenu({} as QueryStringOptions)
            .then(menu => {
                notEqual(menu, null);
                notEqual(schoolMenuService.checkIfMenuIsFetchedFromDB(), null);
                done();
            });
    });
});