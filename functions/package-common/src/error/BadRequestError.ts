import { ErrorWithStatusCode } from "./ErrorWithStatusCode";

export class BadRequestError extends ErrorWithStatusCode {
    
    constructor(message?: string) {
        super();
        super.message = message ? message : 'Bad request.';
        super.statusCode = 400;
    }
}