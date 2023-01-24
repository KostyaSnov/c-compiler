import { Position } from "@scanner";
import { ParserError } from ".";


class UndeclaredVariableError extends ParserError {
    public constructor(name: string, position: Position) {
        super(`Undeclared variable "${name}" on ${position}.`);
    }
}


export default UndeclaredVariableError;