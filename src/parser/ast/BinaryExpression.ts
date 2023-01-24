import { Expression } from ".";


class BinaryExpression extends Expression {
    public constructor(
        public readonly operator: BinaryOperator,
        public readonly leftOperand: Expression,
        public readonly rightOperand: Expression
    ) {
        super();
    }

    public toStringWithIndent(depth: number): string {
        return BinaryExpression.getHeader(depth++, ` ${BinaryOperator[this.operator]}:`) +
            this.leftOperand.toStringWithIndent(depth) +
            this.rightOperand.toStringWithIndent(depth);
    }
}


enum BinaryOperator {
    Add,
    Sub,
    Mul,
    Div,
    Mod,
    Equal,
    NotEqual,
    Greater,
    GreaterOrEqual,
    Less,
    LessOrEqual,
    And,
    Or
}


export { BinaryOperator };
export default BinaryExpression;