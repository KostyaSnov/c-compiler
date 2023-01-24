import { Block, Node, Variable } from ".";


class Function_ extends Node {
    public constructor(
        public readonly name: string,
        public readonly parameters: Variable[],
        public readonly variables: Variable[],
        public readonly block: Block
    ) {
        super();
    }

    public toStringWithIndent(depth: number): string {
        return Function_.getHeader(depth++, ` ${this.name}:`, "Function") +
            this.parameters.reduce((prev, v) => prev += v.toStringWithIndent(depth), "") +
            this.block.toStringWithIndent(depth);
    }
}


export default Function_;