const indent = "    ";


abstract class Node {
    protected static getHeader(depth: number, line = "", name = this.name): string {
        return `${indent.repeat(depth)}${name}${line}\n`;
    }
    
    public abstract toStringWithIndent(depth: number): string;

    public toString(): string {
        return this.toStringWithIndent(0);
    }
}


export default Node;