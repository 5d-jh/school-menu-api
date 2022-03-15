import { ErrorWithStatusCode } from './ErrorWithStatusCode'

export class BadRequestError extends ErrorWithStatusCode {
  constructor (message?: string) {
    super()
    this.message = message || 'Bad request.'
    this.statusCode = 400
  }
}
