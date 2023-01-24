import { Position, TokenType } from ".";


class Token {
    public constructor(
        public readonly type: TokenType,
        public readonly position: Position,
        public readonly value = ""
    ) { }

    public toString(): string {
        if (this.value === "") {
            return `"${this.type}" (${this.position})`;
        }
        return `${this.type} ${this.value} (${this.position})`;
    }
}


export default Token;