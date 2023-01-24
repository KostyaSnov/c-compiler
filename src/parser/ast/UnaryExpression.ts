import { Expression } from ".";


class UnaryExpression extends Expression {
    public constructor(
        public readonly operator: UnaryOperator,
        public readonly operand: Expression
    ) {
        super();
    }

    public toStringWithIndent(depth: number): string {
        return UnaryExpression.getHeader(depth++, ` ${UnaryOperator[this.operator]}:`) +
            this.operand.toStringWithIndent(depth);
    }
}


enum UnaryOperator {
    Plus,
    Minus
}


export { UnaryOperator };
export default UnaryExpression;