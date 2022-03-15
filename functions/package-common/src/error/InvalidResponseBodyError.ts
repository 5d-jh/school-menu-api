import { ErrorWithStatusCode } from './ErrorWithStatusCode'

export class InvalidResponseBodyError extends ErrorWithStatusCode {
  constructor (message?: string) {
    super()
    this.message = message || 'Response body cannot be made without data name and data.'
    this.statusCode = 500
  }
}
