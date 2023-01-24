import { Token } from "@scanner";
import { ParserError } from ".";


class ExpectedTermError extends ParserError {
    public constructor(token: Token) {
        super(`Read token ${token}, but expected term.`);
    }
}


export default ExpectedTermError;