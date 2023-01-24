import { Expression, Statement } from ".";


class Return extends Statement {
    public constructor(public readonly expression?: Expression) {
        super();
    }

    public toStringWithIndent(depth: number): string {
        if (this.expression === undefined) {
            return Return.getHeader(depth);
        }
        return Return.getHeader(depth++, ":") +
            this.expression.toStringWithIndent(depth);
    }
}


export default Return;