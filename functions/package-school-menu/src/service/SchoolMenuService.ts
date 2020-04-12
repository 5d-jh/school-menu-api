import { DataAccessor, Crawler } from "package-common";
import { SchoolMenuList } from "../type/SchoolMenu";

export class SchoolMenuService {

    constructor(
        NeisAccessor: Crawler<SchoolMenuList>,
        DBAccessor: DataAccessor<SchoolMenuList>
    ) {
        NeisAccessor.get();
    }

    private applyOptions(
        options: { date: string, hideAllergy: boolean },
        menu: SchoolMenuList
    ) : SchoolMenuList {
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

    async getSchoolMenu(schoolType: string, schoolCode: string, query: object) {
        
    }
}