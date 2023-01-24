import { Position } from "@scanner";
import { ParserError } from ".";


class DeclarationDeclaredVariableError extends ParserError {
    public constructor(name: string, position: Position) {
        super(`Declaration of an existing variable "${name}" on ${position}.`);
    }
}


export default DeclarationDeclaredVariableError;