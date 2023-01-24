import { Expression, Statement, Variable } from ".";


class Declaration extends Statement {
    public constructor(
        public readonly variable: Variable,
        public readonly expression?: Expression
    ) {
        super();
    }

    public toStringWithIndent(depth: number): string {
        return Declaration.getHeader(depth++, ":") + 
            this.variable.toStringWithIndent(depth) + 
            (this.expression?.toStringWithIndent(depth) ?? "");
    }
}


export default Declaration;