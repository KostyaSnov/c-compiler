import { Node } from "@parser/ast";
import { GeneratorError } from ".";


class UnknownNodeError extends GeneratorError {
    public constructor(node: Node) {
        super(`Unknown node:\n${node}`);
    }
}


export default UnknownNodeError;