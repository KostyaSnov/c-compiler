import { Position, TokenType, Token } from ".";
import { UnknownCharError } from "@scanner/errors";
import { isLetter, isNumber } from "@scanner/utils";


const scan = function* (code: string): IterableIterator<Token> {
    let index = 0;
    let position = new Position(1, 1);


    const getChar = (bias = 0): string => {
        const i = index + bias;
        return i < code.length ? code[i] : "\0";
    }

    const getString = (length: number, bias = 0): string => {
        const start = index + bias;
        if (start >= code.length) {
            return "\0".repeat(length);
        }

        const fullEnd = start + length;
        const end = Math.min(code.length, fullEnd);
        return code.slice(start, end) + "\0".repeat(fullEnd - end);
    }

    const skip = (bias = 1) => {
        const lines = getString(bias).split(newLinesRegExp);
        const line = position.row + lines.length - 1;
        const column = lines.length > 1 ? lines[lines.length - 1].length + 1 : position.column + bias;
        position = new Position(line, column);
        index += bias;
    }

    const scanSomeLexeme = (lexemes: string[], maxLength: number): string | undefined => {
        const fullLexeme = getString(maxLength);
        for (let i = maxLength; i > 0; --i) {
            const lexeme = fullLexeme.slice(0, i);
            if (lexemes.includes(lexeme)) {
                skip(i);
                return lexeme;
            }
        }
        return undefined;
    }

    const scanTableLexeme = (): Token | undefined => {
        const tokenPosition = position;
        const lexeme = scanSomeLexeme(tableLexemes, maxLengthTableLexeme);
        if (lexeme === undefined) {
            return undefined;
        }

        return new Token(lexeme as TokenType, tokenPosition);
    }

    const scanInteger = (): Token | undefined => {
        const tokenPosition = position;
        let value = "";
        let digit = getChar();
        while (isNumber(digit)) {
            value += digit;
            skip();
            digit = getChar();
        }

        if (value.length === 0) {
            return undefined;
        }
        return new Token(TokenType.Integer, tokenPosition, value);
    }

    const scanIdentifier = (): Token | undefined => {
        let char = getChar();
        if (!isLetter(char) && char !== "_") {
            return undefined;
        }

        const tokenPosition = position;
        let value = ""
        do {
            value += char;
            skip();
            char = getChar();
        } while (isLetter(char) || isNumber(char) || char === "_")

        return new Token(TokenType.Identifier, tokenPosition, value);
    }

    const trySkipIgnoreChars = (): boolean => {
        if (!ignoreChars.includes(getChar())) {
            return false;
        }

        do {
            skip();
        } while (ignoreChars.includes(getChar()));
        return true;
    }


    const trySkipLine = (identifier: string): boolean => {
        if (getString(identifier.length) !== identifier) {
            return false;
        }

        skip(identifier.length);
        while (scanSomeLexeme(endLineParts, maxLengthEndLinePart) === undefined) {
            skip();
        }
        return true;
    }

    const trySkipComment = (): boolean => trySkipLine("//");

    const trySkipPreprocessorDirective = (): boolean => trySkipLine("#");


    const trySkipFunctions = [trySkipIgnoreChars, trySkipComment, trySkipPreprocessorDirective];
    const scanFunctions = [scanTableLexeme, scanInteger, scanIdentifier];

    const scanNext = (): Token => {
        while (trySkipFunctions.some(f => f())) { }
        for (const scanFunction of scanFunctions) {
            const token = scanFunction();
            if (token !== undefined) {
                return token;
            }
        }
        throw new UnknownCharError(getChar(), position);
    }


    let token: Token;
    do {
        token = scanNext();
        yield token;
    } while (token.type != TokenType.End);
}


const tableLexemes = [
    TokenType.Equal,
    TokenType.EqualPlus,
    TokenType.EqualMinus,
    TokenType.EqualStar,
    TokenType.EqualSlash,
    TokenType.EqualPercent,
    TokenType.Plus,
    TokenType.Minus,
    TokenType.Star,
    TokenType.Slash,
    TokenType.Percent,
    TokenType.DoubleEqual,
    TokenType.ExclEqual,
    TokenType.Greater,
    TokenType.GreaterEqual,
    TokenType.Less,
    TokenType.LessEqual,
    TokenType.DoubleAmpersand,
    TokenType.DoublePipe,
    TokenType.LeftPar,
    TokenType.RightPar,
    TokenType.LeftBrace,
    TokenType.RightBrace,
    TokenType.Int,
    TokenType.Return,
    TokenType.If,
    TokenType.Else,
    TokenType.While,
    TokenType.Stdin,
    TokenType.Stdout,
    TokenType.Semicolon,
    TokenType.Comma,
    TokenType.End
]
const maxLengthTableLexeme = Math.max(...tableLexemes.map(t => t.length))

const ignoreChars = [" ", "\t", "\n", "\r"];

const endLineParts = ["\0", "\n", "\r\n"];
const maxLengthEndLinePart = Math.max(...endLineParts.map(p => p.length));

const newLinesRegExp = /\r?\n/;


export default scan;