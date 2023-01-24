import { CompilerError } from "@src/errors";


class GeneratorError extends CompilerError {
    public constructor(message: string) {
        super(message);
    }
}


export default GeneratorError;