import { Expression } from ".";


class FunctionCall extends Expression {
    public constructor(
        public readonly name: string,
        public readonly parameters: Expression[]
    ) {
        super();
    }

    public toStringWithIndent(depth: number): string {
        return FunctionCall.getHeader(depth++, ` ${this.name}:`) +
            this.parameters.reduce((prev, p) => prev += p.toStringWithIndent(depth), "");
    }
}


export default FunctionCall;