import { SchoolMenu, SchoolMenuAllergyFormed } from '../type/SchoolMenu'
import { applyAllergyOption } from './applyAllergyOption'
import { applyDateOption } from './applyDateOption'
import { DataAccessor, ReadOnlyDataAccessor } from '@school-api/common'
import { MenuDataAccessorQuery, NeisCrawlerQuery, SchoolMenuServiceParam } from '../type/parameters'

export class SchoolMenuService {
  readonly #neisAccessor: ReadOnlyDataAccessor<NeisCrawlerQuery, SchoolMenu[]>

  readonly #menuDataAccessor: DataAccessor<MenuDataAccessorQuery, SchoolMenu[]>

  constructor (
    neisAccessor: ReadOnlyDataAccessor<NeisCrawlerQuery, SchoolMenu[]>,
    menuDataAccessor: DataAccessor<MenuDataAccessorQuery, SchoolMenu[]>
  ) {
    this.#neisAccessor = neisAccessor
    this.#menuDataAccessor = menuDataAccessor
  }

  #_isMenuFromDB: boolean

  get isMenuFromDB (): boolean {
    return this.#_isMenuFromDB
  }

  static #shouldSave (schoolMenu: SchoolMenu[]): boolean {
    for (let i = 0; i < schoolMenu.length; i++) {
      const menu = schoolMenu[i]

      const isDayEmpty = menu.breakfast.length === 0 &&
            menu.lunch.length === 0 &&
            menu.dinner.length === 0

      if (!isDayEmpty) {
        return true
      }
    }

    return false
  }

  async getSchoolMenu (query: SchoolMenuServiceParam): Promise<SchoolMenu[] | SchoolMenuAllergyFormed[]> {
    let menu: SchoolMenu[] = await this.#menuDataAccessor.get(query)
    this.#_isMenuFromDB = menu != null

    if (!this.#_isMenuFromDB) {
      menu = await this.#neisAccessor.get(query)

      if (SchoolMenuService.#shouldSave(menu)) {
        this.#menuDataAccessor.put(menu)
          .catch((err) => console.error(err))
      }
    }

    let result = null
    if (query.date) result = applyDateOption(menu, query.date)
    if (query.allergy) result = applyAllergyOption(result, query.allergy)

    return result
  }
}
