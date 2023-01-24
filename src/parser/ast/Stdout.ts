import { Expression, Statement } from ".";


class Stdout extends Statement {
    public constructor(public readonly expression: Expression) {
        super();
    }

    public toStringWithIndent(depth: number): string {
        return Stdout.getHeader(depth++, ":") +
            this.expression.toStringWithIndent(depth);
    }
}


export default Stdout;