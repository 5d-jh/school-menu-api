import express from 'express'
import { ErrorResponseBody } from '@school-api/common'
import * as admin from 'firebase-admin'
import schemaValidator from './middleware/schemaValidator'
import service from './middleware/service'

const app = express()

export const schoolMenuApp = (firebaseApp: admin.app.App) => {
  app.use(schemaValidator)

  app.get('*/api/:schoolType/:schoolCode', service(firebaseApp))

  app.use(ErrorResponseBody('menu'))

  return app
}
