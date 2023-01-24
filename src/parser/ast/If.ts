import { Expression, Statement } from ".";


class If extends Statement {
    public constructor(
        public readonly condition: Expression,
        public readonly trueBody: Statement,
        public readonly falseBody?: Statement
    ) {
        super();
    }

    public toStringWithIndent(depth: number): string {
        return If.getHeader(depth++, ":") +
            this.condition.toStringWithIndent(depth) +
            this.trueBody.toStringWithIndent(depth) +
            (this.falseBody?.toStringWithIndent(depth) ?? "");
    }
}


export default If;