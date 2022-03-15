import { SchoolMenu, SchoolMenuAllergyFormed } from '../type/SchoolMenu'
import { AllergyDisplayType } from '../type/AllergyDisplayType'

export const applyAllergyOption = (menu: SchoolMenu[], option: AllergyDisplayType): SchoolMenu[] | SchoolMenuAllergyFormed[] => {
  const regex = /\d{1,2}|[.]|[*]/g
  switch (option) {
    case AllergyDisplayType.HIDDEN:
      return menu.map(day => (
        day.breakfast && day.lunch && day.dinner && {
          date: day.date,
          breakfast: day.breakfast.map(menu => menu.replace(regex, '')),
          lunch: day.lunch.map(menu => menu.replace(regex, '')),
          dinner: day.dinner.map(menu => menu.replace(regex, ''))
        }
      ))

    case AllergyDisplayType.FORMED:
      return menu.map(
        day => ({
          date: day.date,
          breakfast: day.breakfast.map(menu => ({
            name: menu?.replace(regex, ''),
            allergy: menu?.match(regex)?.filter(ch => ch !== '.').map(ch => Number(ch)) || []
          })),
          lunch: day.lunch.map(menu => ({
            name: menu?.replace(regex, ''),
            allergy: menu?.match(regex)?.filter(ch => ch !== '.').map(ch => Number(ch)) || []
          })),
          dinner: day.dinner.map(menu => ({
            name: menu?.replace(regex, ''),
            allergy: menu?.match(regex)?.filter(ch => ch !== '.').map(ch => Number(ch)) || []
          }))
        })
      )

    default:
      return menu
  }
}
