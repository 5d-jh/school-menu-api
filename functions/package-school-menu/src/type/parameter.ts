import { AllergyDisplayType } from './AllergyDisplayType'
import { SchoolType } from '@school-api/common'

export type SchoolMenuIdentifier = {
  schoolType: SchoolType
  schoolCode: string
  menuYear: number
  menuMonth: number
}

export type SchoolMenuOption = {
  allergy?: AllergyDisplayType
  year?: number
  month?: number
  date?: number
}

export type GetSchoolMenu = SchoolMenuIdentifier & Omit<SchoolMenuOption, 'year' | 'month'>
