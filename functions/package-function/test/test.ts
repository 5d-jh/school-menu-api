import supertest from 'supertest'
import app from './server'
import { notStrictEqual } from 'assert'

describe('[Integration] school-menu', function () {
  let request: supertest.SuperTest<supertest.Test>

  this.beforeAll(() => {
    request = supertest(app)
  })

  it('Issue #41', async () => {
    const { body } = await request.get('/api/high/B100002365?year=2019&month=05&date=08')
      .expect(200)

    notStrictEqual(body.menu.length, 0)
  })
})
