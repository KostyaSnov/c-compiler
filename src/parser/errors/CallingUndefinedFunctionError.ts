import { Position } from "@scanner";
import { ParserError } from ".";


class CallingUndefinedFunctionError extends ParserError {
    public constructor(name: string, position: Position) {
        super(`Calling an undeclared function "${name}" on ${position}.`);
    }
}


export default CallingUndefinedFunctionError;