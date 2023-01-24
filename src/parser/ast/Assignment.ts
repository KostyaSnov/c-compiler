import { Expression, Variable } from ".";


class Assignment extends Expression {
    public constructor(
        public readonly operator: AssignmentOperator,
        public readonly variable: Variable,
        public readonly expression: Expression
    ) {
        super();
    }

    public toStringWithIndent(depth: number): string {
        return Assignment.getHeader(depth++, ` ${AssignmentOperator[this.operator]}:`) +
            this.variable.toStringWithIndent(depth) +
            this.expression.toStringWithIndent(depth);
    }
}


enum AssignmentOperator {
    Empty,
    Add,
    Sub,
    Mul,
    Div,
    Mod
}


export { AssignmentOperator };
export default Assignment;