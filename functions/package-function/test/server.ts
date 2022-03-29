import express = require('express');
import { schoolMenuApp } from '@school-api/menu'
import { schoolInfoApp } from '@school-api/info'
import admin from 'firebase-admin'
import { AddressInfo } from 'net'

const fbApp = admin.initializeApp({
  databaseURL: 'http://localhost:8080',
  projectId: 'dummy-firestore-id'
})

const app = express()

app.use(schoolMenuApp(fbApp))
app.use(schoolInfoApp(fbApp))
const server = app.listen(0, () => {
  console.log(`server on ${(server.address() as AddressInfo).port}`)
})

export default app
