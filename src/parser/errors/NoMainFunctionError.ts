import { ParserError } from ".";


class NoMainFunctionError extends ParserError {
    public constructor() {
        super(`Failed to find function "main".`);
    }
}


export default NoMainFunctionError;