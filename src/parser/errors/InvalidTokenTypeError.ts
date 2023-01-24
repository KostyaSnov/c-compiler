import { Token, TokenType } from "@scanner";
import { ParserError } from ".";


class InvalidTokenTypeError extends ParserError {
    public constructor(token: Token, types: TokenType[]) {
        let result = `Invalid token ${token}. `;

        if (types.length > 1) {
            result += "One of the types " +
                types.map(t => `"${t}"`).join(", ") +
                " was expected.";
        }
        else {
            result += `Expected type "${types[0]}".`;
        }
        
        super(result);
    }
}


export default InvalidTokenTypeError;