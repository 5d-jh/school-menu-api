import { InvalidResponseBodyError } from '../error/InvalidResponseBodyError'

export class JsonResponseBody {
    private responseBody = { server_message: [] };

    constructor () {
      this.responseBody.server_message = [
        '문제가 발생했거나 건의사항이 있는 경우 GitHub 저장소 페이지에 이슈를 남겨주세요: https://github.com/5d-jh/school-menu-api/issues'
      ]
    }

    addMessage (message: string) {
      this.responseBody.server_message.push(message)
    }

    create (data: Object): Object {
      if (data.hasOwnProperty('server_message')) {
        throw new InvalidResponseBodyError()
      }
      Object.assign(this.responseBody, data)
      return this.responseBody
    }
}
