import DB from './data-accessors/db';
import neis from './data-accessors/neis';
import { SchoolMenuTable, SchoolType, QueryStringOptions } from './types';

const applyOptions = (
    options: { date?: string, hideAllergy?: Boolean },
    menu: SchoolMenuTable[]
): SchoolMenuTable[] => {
    if (options.date) {
        menu = menu.filter(data => data.date == options.date);
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
  };

export default async (
    schoolType: SchoolType,
    schoolCode: string,
    year?: Number,
    month?: Number,
    queryString?: QueryStringOptions
): Promise<{ menu: SchoolMenuTable[], isFetchedFromDB: Boolean }> => {
    const menuYear = Number(year) || new Date().getFullYear();
    const menuMonth = Number(month) || new Date().getMonth()+1;

    const db = new DB(schoolCode, menuYear, menuMonth);

    let menu = await db.get();

    const isFetchedFromDB = Boolean(menu);

    if (!isFetchedFromDB) {
        const neisData = await neis(schoolType, schoolCode, menuYear, menuMonth);

        menu = neisData.menu;

        if (neisData.shouldSave) {
            db.put(neisData.menu);
        }
    }

    return {
        menu: applyOptions({
            hideAllergy: queryString.hideAllergy === "true" ? true : false,
            date: queryString.date
        }, menu),
        isFetchedFromDB
    }
}