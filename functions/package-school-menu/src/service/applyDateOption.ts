import { SchoolMenu } from "../type/SchoolMenu";

export const applyDateOption = (menu: SchoolMenu[], date: string) => menu.filter(data => data.date === date);
