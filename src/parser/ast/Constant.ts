import { Expression } from ".";


class Constant extends Expression {
    public constructor(public readonly value: number) {
        super();
    }

    public toStringWithIndent(depth: number): string {
        return Constant.getHeader(depth, ` ${this.value}`);
    }
}


export default Constant;