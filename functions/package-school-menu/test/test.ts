import { NeisCrawler } from "../src/data/NeisCrawler";
import { MenuDataAccessor } from "../src/data/MenuDataAccessor";
import { SchoolMenuService } from "../src/service/SchoolMenuService";
import { SchoolType } from "package-common";
import { notEqual, strictEqual } from "assert";
import { QueryStringOptions } from "./type/QueryStringOptions";
import { initializeApp, app, firestore } from "firebase-admin";

initializeApp({
    databaseURL: "https://localhost:8080"
});

console.log(`Database URL: ${app().options.databaseURL}`);

describe("[SCHOOL-MENU] Service", function () {

    this.timeout(50000);

    const db = firestore();

    it("fetches menus from NEIS or database properly", (done) => {
        const neisCrawler = new NeisCrawler()
            .setParameters(SchoolType.HIGH, "K100000460", 2020, 1);
            
        const firestoreAccessor = new MenuDataAccessor(db)
            .setParameters("K100000460", 2020, 1);

        const schoolMenuService = new SchoolMenuService(neisCrawler, firestoreAccessor);

        schoolMenuService.getSchoolMenu({} as QueryStringOptions)
            .then(() => {
                schoolMenuService.getSchoolMenu({} as QueryStringOptions)
                    .then(menu => {
                        notEqual(menu, null);
                        strictEqual(schoolMenuService.checkIfMenuIsFetchedFromDB(), true);
                        done();
                    });
            });    
    });
});