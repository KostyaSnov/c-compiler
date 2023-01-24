import { Expression, Statement } from ".";


class While extends Statement {
    public constructor(
        public readonly condition: Expression,
        public readonly body: Statement
    ) {
        super();
    }

    public toStringWithIndent(depth: number): string {
        return While.getHeader(depth++, ":") +
            this.condition.toStringWithIndent(depth) +
            this.body.toStringWithIndent(depth);
    }
}


export default While;