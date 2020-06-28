import { SchoolMenu, SchoolMenuAllergyFormed } from "../type/SchoolMenu";
import { QueryStringOptions } from "../type/QueryStringOptions";
import { DataAccessor, Crawler } from "package-common";
import { applyAllergyOption } from "./applyAllergyOption";
import { applyDateOption } from "./applyDateOption";

export class SchoolMenuService {

    private neisCrawler: Crawler<SchoolMenu[]>;
    private menuDataAccessor: DataAccessor<SchoolMenu[]>;

    private isMenuFetchedFromDB: boolean;

    constructor(
        neisCrawler: Crawler<SchoolMenu[]>,
        menuDataAccessor: DataAccessor<SchoolMenu[]>
    ) {
        this.neisCrawler = neisCrawler;
        this.menuDataAccessor = menuDataAccessor;
    }

    checkIfMenuIsFetchedFromDB() {
        return this.isMenuFetchedFromDB;
    }

    async getSchoolMenu(query: QueryStringOptions): Promise<SchoolMenu[] | SchoolMenuAllergyFormed[]> {
        let menu: SchoolMenu[] | SchoolMenuAllergyFormed[] = await this.menuDataAccessor.get();
        this.isMenuFetchedFromDB = Boolean(menu);

        if (!this.isMenuFetchedFromDB) {
            menu = await this.neisCrawler.get();

            if (this.neisCrawler.shouldSave()) {
                await this.menuDataAccessor.put(menu)
                    .catch(err => console.error(err));
            }
        }

        if (query.date) menu = applyDateOption(menu, query.date);
        if (query.allergy) menu = applyAllergyOption(menu, query.allergy);

        return menu;
    }
}