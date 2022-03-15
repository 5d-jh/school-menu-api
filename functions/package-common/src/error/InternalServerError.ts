import { ErrorWithStatusCode } from './ErrorWithStatusCode'

export class InternalServerError extends ErrorWithStatusCode {
  constructor (message?: string) {
    super()
    this.message = message || 'Internal server error.'
    this.statusCode = 500
  }
}
