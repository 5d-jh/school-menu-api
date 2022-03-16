import { SchoolInfo } from './SchoolInfo'

export type NeisCrawlerQuery = {
  searchKeyword: string
}

export type SchoolInfoAccessorQuery = NeisCrawlerQuery & {
  neisFetched?: SchoolInfo[]
}
