import { Statement } from ".";


class Block extends Statement {
    public constructor(public readonly statements: Statement[]) {
        super();
    }

    public toStringWithIndent(depth: number): string {
        return Block.getHeader(depth++, ":") +
            this.statements.reduce((prev, s) => prev += s.toStringWithIndent(depth), "");
    }
}


export default Block;