import * as express from 'express'
import { schoolMenuApp } from '@school-api/menu'
import { schoolInfoApp } from '@school-api/info'
import admin from 'firebase-admin'
import { env } from 'process'
import { AddressInfo } from 'net'

let fbApp

if (env.NODE_ENV === 'local') {
  fbApp = admin.initializeApp({
    databaseURL: 'http://localhost:8080'
  })
} else {
  fbApp = admin.initializeApp()
}

const app = express.default()

app.use(schoolMenuApp(fbApp))
app.use(schoolInfoApp(fbApp))
const server = app.listen(0, () => {
  console.log(`server on ${(server.address() as AddressInfo).port}`)
})

export default app
