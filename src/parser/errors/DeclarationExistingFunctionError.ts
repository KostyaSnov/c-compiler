import { Position } from "@scanner";
import { ParserError } from ".";


class DeclarationExistingFunctionError extends ParserError {
    public constructor(name: string, position: Position) {
        super(`Declaration of an existing function "${name}" on ${position}.`);
    }
}


export default DeclarationExistingFunctionError;