import { Statement, Variable } from ".";


class Stdin extends Statement {
    public constructor(public readonly variable: Variable) {
        super();
    }

    public toStringWithIndent(depth: number): string {
        return Stdin.getHeader(depth++, ":") +
            this.variable.toStringWithIndent(depth);
    }
}


export default Stdin;