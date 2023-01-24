import { Position } from "@scanner";
import { ParserError } from ".";


class InvalidNumberFunctionParameters extends ParserError {
    public constructor(name: string, expected: number, received: number, position: Position) {
        super(`Invalid number of parameters for calling function "${name}" on ${position}. Expected ${expected}, but received ${received}.`);
    }
}


export default InvalidNumberFunctionParameters;