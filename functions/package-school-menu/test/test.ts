import { NeisCrawler } from "../src/data/NeisCrawler";
import { SchoolType } from "package-common";
import { notEqual } from "assert";

describe("[SCHOOL-MENU] NeisCrawler", function () {

    this.timeout(10000);

    it("Fetches menus from NEIS properly", (done) => {
        const neisCrawler = new NeisCrawler(SchoolType.HIGH, "K100000460", 2020, 1);
        neisCrawler.get()
        .then(menu => {
            notEqual(null, menu);
        })
        .then(() => {
            console.log(neisCrawler.checkIfShouldSave());
            done();
        });
    });
});