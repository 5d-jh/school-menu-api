import { SchoolMenu, SchoolMenuAllergyFormed } from '../type/SchoolMenu'
import { Crawler } from '@school-api/common'
import { applyAllergyOption } from './applyAllergyOption'
import { applyDateOption } from './applyDateOption'
import { MenuDataAccessor } from '../data/MenuDataAccessor'
import { GetSchoolMenu, SchoolMenuIdentifier } from '../type/parameter'

export class SchoolMenuService {
    private neisCrawler: Crawler<SchoolMenu[], SchoolMenuIdentifier>;
    private menuDataAccessor: MenuDataAccessor;

    private isMenuFetchedFromDB: boolean;

    constructor (
      neisCrawler: Crawler<SchoolMenu[], SchoolMenuIdentifier>,
      menuDataAccessor: MenuDataAccessor
    ) {
      this.neisCrawler = neisCrawler
      this.menuDataAccessor = menuDataAccessor
    }

    checkIfMenuIsFetchedFromDB () {
      return this.isMenuFetchedFromDB
    }

    async getSchoolMenu (parameter: Readonly<GetSchoolMenu>): Promise<SchoolMenu[] | SchoolMenuAllergyFormed[]> {
      let menu: SchoolMenu[] | SchoolMenuAllergyFormed[] = await this.menuDataAccessor.get(parameter)
      this.isMenuFetchedFromDB = menu != null

      if (!this.isMenuFetchedFromDB) {
        menu = await this.neisCrawler.get(parameter)

        if (this.neisCrawler.shouldSave()) {
          await this.menuDataAccessor.put(parameter, menu as SchoolMenu[])
            .catch(err => console.error(err))
        }
      }

      if (parameter.date) menu = applyDateOption(menu as SchoolMenu[], parameter.date)
      if (parameter.allergy) menu = applyAllergyOption(menu as SchoolMenu[], parameter.allergy)

      return menu
    }
}
