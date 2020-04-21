import { SchoolMenu } from "../type/SchoolMenu";
import { QueryStringOptions } from "../type/QueryStringOptions";
import { DataAccessor, Crawler } from "package-common";

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

    private applyOptions(
        options: { date: string, hideAllergy: boolean },
        menu: SchoolMenu[]
    ) : SchoolMenu[] {
        if (options.date) {
            menu = menu.filter(data => data.date === options.date);
        }
    
        if (options.hideAllergy) {
            const regex = /\d|[.]|[*]/g;
            menu = menu.map(day => (
                day.breakfast && day.lunch && day.dinner && {
                    date: day.date,
                    breakfast: day.breakfast.map(menu => menu.replace(regex, '')),
                    lunch: day.lunch.map(menu => menu.replace(regex, '')),
                    dinner: day.dinner.map(menu => menu.replace(regex, ''))
                }
            ));
        }

        return menu;
    }

    checkIfMenuIsFetchedFromDB() {
        return this.isMenuFetchedFromDB;
    }

    async getSchoolMenu(query: QueryStringOptions): Promise<SchoolMenu[]> {

        let menu = await this.firestoreAccessor.get();
        this.isMenuFetchedFromDB = Boolean(menu);

        if (!this.isMenuFetchedFromDB) {
            menu = await this.neisCrawler.get();

            if (this.neisCrawler.shouldSave()) {
                this.firestoreAccessor.put(menu)
                    .then(() => this.firestoreAccessor.close())
                    .catch(err => console.error(err));
            }
        }
  
        return this.applyOptions({
            hideAllergy: query.hideAllergy === "true" ? true : false,
            date: query.date
        }, menu);
    }
}