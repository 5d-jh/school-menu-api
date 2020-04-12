import { ErrorWithStatusCode } from "./ErrorWithStatusCode";

export class ParsingError extends ErrorWithStatusCode {
    
    constructor(message?: string) {
        super();
        super.message = message ? message : 'Parsing error.';
        super.statusCode = 500;
    }
}