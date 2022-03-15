import { JsonResponseBody } from './JsonResponseBody'

export const ErrorResponseBody = (key: string) => (err, req, res, next) => {
  const jsonResponseBody = new JsonResponseBody()
  jsonResponseBody.addMessage(`오류: ${err.message}`)

  const value = {}
  value[key] = []

  res.status(err.status || 500).json(jsonResponseBody.create(value))
}
