import { Position } from "@scanner";
import { ParserError } from ".";


class ExpectedBlockError extends ParserError {
    public constructor(position: Position) {
        super(`Expected block on ${position}.`);
    }
}


export default ExpectedBlockError;