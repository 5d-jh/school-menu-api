import { ErrorWithStatusCode } from "./ErrorWithStatusCode";

export class InternalServerError extends ErrorWithStatusCode {
    
    constructor(message?: string) {
        super();
        super.message = message ? message : 'Internal server error.';
        super.statusCode = 500;
    }
}