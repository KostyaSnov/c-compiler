import { Expression } from ".";


class Variable extends Expression {
    public constructor(
        public readonly name: string,
        public readonly blockId: number
    ) {
        super();
    }

    public toStringWithIndent(depth: number): string {
        return Variable.getHeader(depth, ` ${this.name}_${this.blockId}`);
    }
}


export default Variable;