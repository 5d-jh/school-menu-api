import { Handler } from 'express'
import { JsonResponseBody, SchoolType, BadRequestError } from '@school-api/common'
import { SchoolMenuService } from '../service/SchoolMenuService'
import { NeisCrawler } from '../data/NeisCrawler'
import { MenuDataAccessor } from '../data/MenuDataAccessor'
import * as admin from 'firebase-admin'
import { SchoolMenuOption } from '../type/parameter'

const service = (firebaseApp: admin.app.App): Handler => async (req, res, next) => {
  const schoolCode = req.params.schoolCode
  const schoolType: SchoolType = SchoolType[req.params.schoolType.toUpperCase()]

  const options: SchoolMenuOption = req.query

  const {
    year: menuYear,
    month: menuMonth,
    date,
    allergy
  } = options

  const neisCrawler = new NeisCrawler()

  const menuDataAccessor = new MenuDataAccessor(firebaseApp.firestore())

  const schoolMenuService = new SchoolMenuService(neisCrawler, menuDataAccessor)

  try {
    if (schoolType == null) throw new BadRequestError('학교 유형이 잘못되었습니다.')

    const menu = await schoolMenuService.getSchoolMenu({
      schoolType,
      schoolCode,
      menuYear,
      menuMonth,
      date,
      allergy
    })
    const jsonResponseBody = new JsonResponseBody()

    jsonResponseBody.addMessage(
      schoolMenuService.checkIfMenuIsFetchedFromDB() ? '자체 서버에서 데이터를 불러왔습니다.' : 'NEIS에서 데이터를 불러왔습니다.'
    )
    res.json(jsonResponseBody.create({ menu }))
  } catch (error) {
    next(error)
  }
}

export default service
