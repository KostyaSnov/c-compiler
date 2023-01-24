import { Position, Token, TokenType } from "@scanner";
import {
    InvalidTokenTypeError, UndeclaredVariableError,
    ExpectedTermError, DeclarationDeclaredVariableError,
    ExpectedBlockError, DeclarationExistingFunctionError,
    NoMainFunctionError, CallingUndefinedFunctionError, InvalidNumberFunctionParameters
} from "@parser/errors";
import {
    AssignmentOperator, UnaryOperator, BinaryOperator, Expression,
    Constant, Variable, UnaryExpression, BinaryExpression, Assignment,
    Statement, Declaration, Stdin, Stdout, Block, While, If, Function_,
    FunctionCall, Return
} from "@parser/ast";


const parse = (tokens: Token[]): Function_[] => {
    let index = 0;

    type BlockNode = {
        parent: BlockNode | null;
        id: number;
    }
    let blockNode: BlockNode;
    let nextBlockId: number;
    let variables: Variable[];

    type FunctionCallInfo = {
        functionCall: FunctionCall,
        position: Position;
    }
    const functionCallInfos: FunctionCallInfo[] = [];


    const getToken = (bias = 0): Token => {
        const i = Math.min(index + bias, tokens.length - 1);
        return tokens[i];
    }

    const skip = (bias = 1) => {
        index += bias;
    }


    class Is {
        private readonly _token: Token;
        private readonly _types: TokenType[];
        private _func: () => boolean;

        public constructor(token: Token, types: TokenType[]) {
            this._token = token;
            this._types = types;
            this._func = () => types.includes(token.type);
        }

        public get result(): boolean {
            return this._func();
        }

        public throw(): Is {
            const func = this._func;
            this._func = () => {
                if (func()) {
                    return true;
                }
                throw new InvalidTokenTypeError(this._token, this._types);
            }
            return this;
        }

        public skip(bias = 1): Is {
            const func = this._func;
            this._func = () => {
                const result = func();
                if (result) {
                    skip(bias);
                }
                return result;
            }
            return this;
        }
    }

    const is = (token: Token, ...types: TokenType[]): Is => new Is(token, types);


    const hasVariable = (name: string, blockId: number): boolean => variables.some(v => v.name == name && v.blockId == blockId);

    const getVariableBlockId = (name: string): number | undefined => {
        for (let node = blockNode; node !== null; node = node.parent!) {
            if (hasVariable(name, node.id)) {
                return node.id;
            }
        }
        return undefined;
    }

    const parseIf = (): If | undefined => {
        if (!is(getToken(), TokenType.If).skip().result) {
            return undefined;
        }

        is(getToken(), TokenType.LeftPar).skip().throw().result;
        const condition = parseExpression();
        is(getToken(), TokenType.RightPar).skip().throw().result;
        const trueBody = parseStatement();
        let falseBody: Statement | undefined = undefined;
        if (is(getToken(), TokenType.Else).skip().result) {
            falseBody = parseStatement();
        }
        return new If(condition, trueBody, falseBody);
    }

    const parseWhile = (): While | undefined => {
        if (!is(getToken(), TokenType.While).skip().result) {
            return undefined;
        }

        is(getToken(), TokenType.LeftPar).skip().throw().result;
        const condition = parseExpression();
        is(getToken(), TokenType.RightPar).skip().throw().result;
        const body = parseStatement();
        return new While(condition, body);
    }

    const parseBlock = (): Block | undefined => {
        if (!is(getToken(), TokenType.LeftBrace).skip().result) {
            return undefined;
        }

        blockNode = {
            parent: blockNode,
            id: nextBlockId++
        };
        const statements: Statement[] = [];
        while (!is(getToken(), TokenType.RightBrace).skip().result) {
            statements.push(parseStatement());
        }
        blockNode = blockNode.parent!;
        return new Block(statements);
    }

    const parseStdout = (): Stdout | undefined => {
        if (!is(getToken(), TokenType.Stdout).skip().result) {
            return undefined;
        }

        is(getToken(), TokenType.LeftPar).skip().throw().result;
        const expression = parseExpression();
        is(getToken(), TokenType.RightPar).skip().throw().result;
        is(getToken(), TokenType.Semicolon).skip().throw().result;
        return new Stdout(expression);
    }

    const parseStdin = (): Stdin | undefined => {
        if (!is(getToken(), TokenType.Stdin).skip().result) {
            return undefined;
        }

        is(getToken(), TokenType.LeftPar).skip().throw().result;
        const token = getToken();
        is(token, TokenType.Identifier).skip().throw().result;
        const name = token.value;
        const blockId = getVariableBlockId(name);
        if (blockId === undefined) {
            throw new UndeclaredVariableError(name, token.position);
        }
        is(getToken(), TokenType.RightPar).skip().throw().result;
        is(getToken(), TokenType.Semicolon).skip().throw().result;
        return new Stdin(new Variable(name, blockId));
    }

    const parseDeclaration = (): Declaration | undefined => {
        const token = getToken();
        if (!is(token, TokenType.Int).skip().result) {
            return undefined;
        }

        const variableToken = getToken();
        is(variableToken, TokenType.Identifier).skip().throw().result;
        const name = variableToken.value;
        if (hasVariable(name, blockNode.id)) {
            throw new DeclarationDeclaredVariableError(name, token.position);
        }

        let expression: Expression | undefined = undefined;
        if (is(getToken(), TokenType.Equal).skip().result) {
            expression = parseExpression();
        }
        is(getToken(), TokenType.Semicolon).skip().throw().result;
        const variable = new Variable(name, blockNode.id);
        variables.push(variable);
        return new Declaration(variable, expression);
    }

    const parseReturn = (): Return | undefined => {
        if (!is(getToken(), TokenType.Return).skip().result) {
            return undefined;
        }

        if (is(getToken(), TokenType.Semicolon).skip().result) {
            return new Return();
        }
        const result = new Return(parseExpression());
        is(getToken(), TokenType.Semicolon).skip().throw().result;
        return result;
    }

    const parseStatementFunctions = [
        parseReturn, parseDeclaration, parseStdin,
        parseStdout, parseBlock, parseWhile, parseIf
    ];

    const parseStatement = (): Statement => {
        for (const parseStatementFunction of parseStatementFunctions) {
            const statement = parseStatementFunction();
            if (statement !== undefined) {
                return statement;
            }
        }

        const expression = parseExpression();
        is(getToken(), TokenType.Semicolon).skip().throw().result;
        return expression;
    }

    const parseExpression = (): Expression => parseAssignment();

    const parseAssignment = (): Expression => {
        const token = getToken();
        const operator = assignmentTable[getToken(1).type];
        if (!is(token, TokenType.Identifier).result || operator === undefined) {
            return parseOr();
        }

        skip(2);
        const name = token.value;
        const blockId = getVariableBlockId(name);
        if (blockId === undefined) {
            throw new UndeclaredVariableError(name, token.position);
        }
        return new Assignment(operator, new Variable(name, blockId), parseExpression());
    }

    const parseOr = (): Expression => parseBinaryExpression(orTable, parseAnd);

    const parseAnd = (): Expression => parseBinaryExpression(andTable, parseEquality);

    const parseEquality = (): Expression => parseBinaryExpression(equalityTable, parseComparison);

    const parseComparison = (): Expression => parseBinaryExpression(comparisonTable, parseAdditive);

    const parseAdditive = (): Expression => parseBinaryExpression(additiveTable, parseMultiplicative);

    const parseMultiplicative = (): Expression => parseBinaryExpression(multiplicativeTable, parseUnaryExpression);

    const parseBinaryExpression = (operators: TableBinaryOperators, parseLower: () => Expression): Expression => {
        let leftOperand = parseLower();
        let operator = operators[getToken().type];
        while (operator !== undefined) {
            skip();
            const rightOperand = parseLower();
            leftOperand = new BinaryExpression(operator, leftOperand, rightOperand);
            operator = operators[getToken().type];
        }
        return leftOperand;
    }

    const parseUnaryExpression = (): Expression => {
        const token = getToken();
        const operator = unaryTable[token.type];
        if (operator === undefined) {
            return parseFunctionCall();
        }

        skip();
        return new UnaryExpression(operator, parseFunctionCall());
    }

    const parseFunctionCall = (): Expression => {
        const token = getToken();
        if (!is(token, TokenType.Identifier).result || !is(getToken(1), TokenType.LeftPar).result) {
            return parseTerm();
        }

        skip(2);
        const parameters: Expression[] = [];
        if (!is(getToken(), TokenType.RightPar).skip().result) {
            while (true) {
                parameters.push(parseExpression());
                if (is(getToken(), TokenType.RightPar).skip().result) {
                    break;
                }
                is(getToken(), TokenType.Comma).skip().throw().result;
            }
        }

        const result = new FunctionCall(token.value, parameters);
        functionCallInfos.push({
            functionCall: result,
            position: token.position
        });
        return result;
    }

    const parseTerm = (): Expression => {
        const token = getToken();

        if (is(token, TokenType.Integer).skip().result) {
            return new Constant(parseInt(token.value));
        }

        if (is(token, TokenType.Identifier).skip().result) {
            const name = token.value;
            const blockId = getVariableBlockId(name);
            if (blockId === undefined) {
                throw new UndeclaredVariableError(name, token.position);
            }
            return new Variable(name, blockId);
        }

        if (is(token, TokenType.LeftPar).skip().result) {
            const expression = parseExpression();
            is(getToken(), TokenType.RightPar).skip().throw().result;
            return expression;
        }

        throw new ExpectedTermError(token);
    }


    const parseFunction = (): Function_ | undefined => {
        if (is(getToken(), TokenType.End).result) {
            return undefined;
        }

        blockNode = {
            parent: null,
            id: 0
        };
        nextBlockId = blockNode.id + 1;
        variables = [];

        is(getToken(), TokenType.Int).skip().throw().result;
        const token = getToken();
        is(token, TokenType.Identifier).skip().throw().result;
        const name = token.value;

        const parameters: Variable[] = [];
        is(getToken(), TokenType.LeftPar).skip().throw().result;
        if (!is(getToken(), TokenType.RightPar).skip().result) {
            while (true) {
                is(getToken(), TokenType.Int).skip().throw().result;
                const token = getToken();
                is(token, TokenType.Identifier).skip().throw().result;
                const variable = new Variable(token.value, nextBlockId);
                parameters.push(variable);
                variables.push(variable);
                if (is(getToken(), TokenType.RightPar).skip().result) {
                    break;
                }
                is(getToken(), TokenType.Comma).skip().throw().result;
            }
        }

        const blockPosition = getToken().position;
        const block = parseBlock();
        if (block === undefined) {
            throw new ExpectedBlockError(blockPosition);
        }

        return new Function_(name, parameters, variables, block);
    }

    const functions: Function_[] = [];
    while (true) {
        const position = getToken().position;
        const function_ = parseFunction();
        if (function_ === undefined) {
            break;
        }
        const name = function_.name;
        if (functions.some(f => f.name === name)) {
            throw new DeclarationExistingFunctionError(name, position);
        }
        functions.push(function_);
    }

    if (functions.every(f => f.name !== "main")) {
        throw new NoMainFunctionError();
    }

    for (const info of functionCallInfos) {
        const position = info.position;

        const name = info.functionCall.name;
        const function_ = functions.find(v => v.name == name);
        if (function_ === undefined) {
            throw new CallingUndefinedFunctionError(name, info.position);
        }

        const expected = function_.parameters.length;
        const received = info.functionCall.parameters.length;
        if (expected !== received) {
            throw new InvalidNumberFunctionParameters(name, expected, received, position);
        }
    }
    
    return functions;
}


type TableAssignmentOperators = Readonly<Record<TokenType, AssignmentOperator | undefined>>;
type TableBinaryOperators = Readonly<Record<TokenType, BinaryOperator | undefined>>;
type TableUnaryOperators = Readonly<Record<TokenType, UnaryOperator | undefined>>;

const assignmentTable = {
    [TokenType.Equal]: AssignmentOperator.Empty,
    [TokenType.EqualPlus]: AssignmentOperator.Add,
    [TokenType.EqualMinus]: AssignmentOperator.Sub,
    [TokenType.EqualStar]: AssignmentOperator.Mul,
    [TokenType.EqualSlash]: AssignmentOperator.Div,
    [TokenType.EqualPercent]: AssignmentOperator.Mod
} as TableAssignmentOperators;

const orTable = {
    [TokenType.DoublePipe]: BinaryOperator.Or
} as TableBinaryOperators;

const andTable = {
    [TokenType.DoubleAmpersand]: BinaryOperator.And
} as TableBinaryOperators;

const equalityTable = {
    [TokenType.DoubleEqual]: BinaryOperator.Equal,
    [TokenType.ExclEqual]: BinaryOperator.NotEqual
} as TableBinaryOperators;

const comparisonTable = {
    [TokenType.Greater]: BinaryOperator.Greater,
    [TokenType.GreaterEqual]: BinaryOperator.GreaterOrEqual,
    [TokenType.Less]: BinaryOperator.Less,
    [TokenType.LessEqual]: BinaryOperator.LessOrEqual
} as TableBinaryOperators;

const additiveTable = {
    [TokenType.Plus]: BinaryOperator.Add,
    [TokenType.Minus]: BinaryOperator.Sub
} as TableBinaryOperators;

const multiplicativeTable = {
    [TokenType.Star]: BinaryOperator.Mul,
    [TokenType.Slash]: BinaryOperator.Div,
    [TokenType.Percent]: BinaryOperator.Mod
} as TableBinaryOperators;

const unaryTable = {
    [TokenType.Plus]: UnaryOperator.Plus,
    [TokenType.Minus]: UnaryOperator.Minus
} as TableUnaryOperators;


export default parse;