const enum TokenType {
    Equal = "=",
    EqualPlus = "+=",
    EqualMinus = "-=",
    EqualStar = "*=",
    EqualSlash = "/-",
    EqualPercent = "%=",
    Plus = "+",
    Minus = "-",
    Star = "*",
    Slash = "/",
    Percent = "%",
    DoubleEqual = "==",
    ExclEqual = "!=",
    Greater = ">",
    GreaterEqual = ">=",
    Less = "<",
    LessEqual = "<=",
    DoubleAmpersand = "&&",
    DoublePipe = "||",
    LeftPar = "(",
    RightPar = ")",
    LeftBrace = "{",
    RightBrace = "}",
    Int = "int",
    Return = "return",
    Integer = "Integer",
    Identifier = "Identifier",
    If = "if",
    Else = "else",
    While = "while",
    Stdin = "stdin",
    Stdout = "stdout",
    Semicolon = ";",
    Comma = ",",
    End = "\0"
}


export default TokenType;