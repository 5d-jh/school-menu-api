import { SchoolType } from '@school-api/common'
import { AllergyDisplayType } from './AllergyDisplayType'

export type NeisCrawlerQuery = {
  schoolType: SchoolType,
  schoolCode: string,
  menuYear: number,
  menuMonth: number,
}

export type MenuDataAccessorQuery = {
  schoolCode: string,
  menuYear: number,
  menuMonth: number,
}

export type SchoolMenuServiceParam = NeisCrawlerQuery & MenuDataAccessorQuery & {
  date: number,
  allergy: AllergyDisplayType
}
