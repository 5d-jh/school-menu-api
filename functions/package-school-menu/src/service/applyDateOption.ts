import { SchoolMenu } from '../type/SchoolMenu'

export const applyDateOption = (menu: SchoolMenu[], date: number) => menu.filter(data => Number(data.date) === date)
