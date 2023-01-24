import { Position } from "@scanner";
import { ScannerError } from ".";


class UnknownCharError extends ScannerError {
    public constructor(char: string, position: Position) {
        super(`Unknown char \"${char}\" on ${position}.`);
    }
}


export default UnknownCharError;