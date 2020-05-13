import { SchoolMenu, SchoolMenuAllergyFormed } from "../type/SchoolMenu";
import { QueryStringOptions } from "../type/QueryStringOptions";
import { DataAccessor, Crawler } from "package-common";
import { applyAllergyOption } from "./applyAllergyOption";
import { applyDateOption } from "./applyDateOption";

export class SchoolMenuService {

    private neisCrawler: Crawler<SchoolMenu[]>;
    private firestoreAccessor: DataAccessor<SchoolMenu[]>;

    private isMenuFetchedFromDB: boolean;

    constructor(
        neisCrawler: Crawler<SchoolMenu[]>,
        firestoreAccessor: DataAccessor<SchoolMenu[]>
    ) {
        this.neisCrawler = neisCrawler;
        this.firestoreAccessor = firestoreAccessor;
    }

    checkIfMenuIsFetchedFromDB() {
        return this.isMenuFetchedFromDB;
    }

    async getSchoolMenu(query: QueryStringOptions): Promise<SchoolMenu[] | SchoolMenuAllergyFormed[]> {
        let menu: SchoolMenu[] | SchoolMenuAllergyFormed[] = await this.firestoreAccessor.get();
        this.isMenuFetchedFromDB = Boolean(menu);

        if (!this.isMenuFetchedFromDB) {
            menu = await this.neisCrawler.get();

            if (this.neisCrawler.shouldSave()) {
                this.firestoreAccessor.put(menu)
                    .then(() => this.firestoreAccessor.close())
                    .catch(err => console.error(err));
            }
        }

        if (query.date) menu = applyDateOption(menu, query.date);
        if (query.allergy) menu = applyAllergyOption(menu, query.allergy);

        return menu;
    }
}