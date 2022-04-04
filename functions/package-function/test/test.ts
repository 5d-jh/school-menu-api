import supertest from 'supertest'
import app from './server'
import { equal, notEqual } from 'assert/strict'

describe('[Integration] school-menu', function () {
  let request: supertest.SuperTest<supertest.Test>

  beforeAll(() => {
    request = supertest(app)
  })

  it('Issue #41', async () => {
    const { body } = await request.get('/api/high/B100002365?year=2019&month=05&date=08')
      .expect(200)

    notEqual(body.menu.length, 0)
  })

  it('Issue #126', async () => {
    const { body } = await request.get('/api/high/G100000170?year=2022&month=3&date=30')
      .expect(200)

    equal(body.menu.length, 1)
  })

  it('Issue #130', async () => {
    const { body } = await request.get('/api/high/G100000170?year=2022&month=3&allergy=formed')
      .expect(200)

    expect(body.menu[1].breakfast[0].allergy).toBeTruthy()
    expect(body.menu[1].breakfast[0].allergy.length).toBeGreaterThan(0)
  })
})
