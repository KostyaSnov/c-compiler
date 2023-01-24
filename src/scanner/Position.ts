class Position {
    public constructor(
        public readonly row: number,
        public readonly column: number
    ) { }

    public toString(): string {
        return `row ${this.row}, column ${this.column}`;
    }
}


export default Position;