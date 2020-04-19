import { ErrorWithStatusCode } from "./ErrorWithStatusCode";

export class InvalidResponseBodyError extends ErrorWithStatusCode {
    
    constructor(message?: string) {
        super();
        super.message = message ? message : 'Response body cannot be made without data name and data.';
        super.statusCode = 500;
    }
}