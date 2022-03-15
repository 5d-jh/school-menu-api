import assert from 'assert'
import { JsonResponseBody } from '../src/util/JsonResponseBody'

describe('[COMMON] util', function () {
  it(
    'throws InvalidResponseBody error when server_message is overriden',
    done => {
      assert.throws(() => {
        const jsonResponseBody = new JsonResponseBody()
        jsonResponseBody.create({ server_message: '' })
      })
      done()
    }
  )

  it(
    'creates an object when server_message is not overriden',
    done => {
      const jsonResponseBody = new JsonResponseBody()
      jsonResponseBody.addMessage('Testing')
      const response = jsonResponseBody.create({})
      assert.strictEqual(typeof response, 'object')
      assert.strictEqual((response as { server_message: string[] }).server_message.includes('Testing'), true)
      done()
    }
  )
})
