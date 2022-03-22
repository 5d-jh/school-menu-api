import express from 'express'
import path from 'path'
import nunjucks from 'nunjucks'
import * as admin from 'firebase-admin'
import { JsonResponseBody, ErrorResponseBody } from '@school-api/common'
import { NeisCrawler } from './data/NeisCrawler'
import { SchoolInfoDataAccessor } from './data/SchoolInfoDataAccessor'
import { SchoolInfoService } from './service/SchoolInfoService'

const app = express()

nunjucks.configure(path.resolve(__dirname, '../view'), {
  autoescape: true,
  express: app
})

export const schoolInfoApp = (firebaseApp: admin.app.App) => {
  const firestore = firebaseApp.firestore()

  app.use('/code/static', express.static(path.resolve(__dirname, '../static')))

  app.get('*/code/api', async (req, res, next) => {
    const searchKeyword = req.query.q as string || ''
    let schoolInfos

    try {
      if (searchKeyword.length > 0) {
        const neisCrawler = new NeisCrawler()
        const schoolInfoDataAccessor = new SchoolInfoDataAccessor(firestore)
        const schoolInfoService = new SchoolInfoService(neisCrawler, schoolInfoDataAccessor)

        schoolInfos = await schoolInfoService.getSchoolInfos({ searchKeyword })
      } else {
        schoolInfos = []
      }

      const jsonResponseBody = new JsonResponseBody()

      res.json(
        jsonResponseBody.create({
          school_infos: schoolInfos
        })
      )
    } catch (error) {
      next(error)
    }
  })

  app.get('*/code/app', async (req, res, next) => {
    const searchKeyword = req.query.q as string || ''
    let schoolInfos

    try {
      if (searchKeyword.length > 0) {
        const neisCrawler = new NeisCrawler()
        const schoolInfoDataAccessor = new SchoolInfoDataAccessor(firestore)
        const schoolInfoService = new SchoolInfoService(neisCrawler, schoolInfoDataAccessor)

        schoolInfos = await schoolInfoService.getSchoolInfos({ searchKeyword })
      } else {
        schoolInfos = []
      }

      res.render('index.html', {
        query: searchKeyword,
        school_infos: schoolInfos
      })
    } catch (error) {
      next(error)
    }
  })

  app.use(ErrorResponseBody('school_infos'))

  return app
}
