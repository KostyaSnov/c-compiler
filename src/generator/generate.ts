import {
    Assignment, AssignmentOperator, BinaryExpression, BinaryOperator,
    Block, Constant, Declaration, Expression, FunctionCall, Function_, If, Return, Statement,
    Stdin, Stdout, UnaryExpression, UnaryOperator, Variable, While
} from "@parser/ast";
import { UnknownNodeError } from "@generator/errors";


const generate = (functions: Function_[]): string => {
    let code: string;
    let depth: number;


    const push = (...commands: string[]) => {
        const indent = t(depth);
        code += commands.map(c => `${indent}${c}\n`).join("");
    }

    const generateBlock = (block: Block) => {
        block.statements.forEach(generateStatement);
    }

    const generateDeclaration = (declaration: Declaration) => {
        const name = getVariableName(declaration.variable);
        if (declaration.expression !== undefined) {
            generateMoveExpression(declaration.expression);
            push(`mov ${name}, eax`);
        }
    }

    const generateStdin = (stdin: Stdin) => {
        push(
            "INVOKE StdIn, addr int_buffer, 11",
            "INVOKE atol, addr int_buffer",
            `mov ${getVariableName(stdin.variable)}, eax`
        );
    }

    const generateStdout = (stdout: Stdout) => {
        generateMoveExpression(stdout.expression);
        push(
            "INVOKE dwtoa, eax, addr int_buffer",
            "INVOKE StdOut, addr int_buffer",
            "INVOKE StdOut, addr new_line"
        );
    }

    const generateWhile = (while_: While) => {
        generateMoveExpression(while_.condition);
        push(".WHILE eax");
        ++depth;
        generateStatement(while_.body);
        generateMoveExpression(while_.condition);
        --depth;
        push(".ENDW");
    }

    const generateIf = (if_: If) => {
        generateMoveExpression(if_.condition);
        push(".IF eax");
        ++depth;
        generateStatement(if_.trueBody);
        --depth;
        if (if_.falseBody !== undefined) {
            push(".ELSE");
            ++depth;
            generateStatement(if_.falseBody);
            --depth;
        }
        push(".ENDIF");
    }

    const generateReturn = (return_: Return) => {
        if (return_.expression === undefined) {
            push("mov eax, 0");
        }
        else {
            generateMoveExpression(return_.expression);
        }
        push("RET");
    }

    const generateStatementFunctions = {
        [Block.name]: generateBlock,
        [Declaration.name]: generateDeclaration,
        [Stdin.name]: generateStdin,
        [Stdout.name]: generateStdout,
        [While.name]: generateWhile,
        [If.name]: generateIf,
        [Return.name]: generateReturn
    } as Readonly<Record<string, ((statement: Statement) => void) | undefined>>;

    const generateStatement = (statement: Statement) => {
        const generateStatementFunction = generateStatementFunctions[statement.constructor.name];
        if (generateStatementFunction !== undefined) {
            generateStatementFunction(statement);
            return;
        }
        if (statement instanceof Expression) {
            generateMoveExpression(statement);
            return;
        }
        throw new UnknownNodeError(statement);
    }

    const generateMoveFunctionCall = (functionCall: FunctionCall) => {
        const parameters = functionCall.parameters;
        for (let i = 0; i < parameters.length; ++i) {
            generateMoveExpression(parameters[i]);
            push(`mov ${getParameterName(i)}, eax`)
        }
        push(`INVOKE ${getFunctionName(functionCall.name)}`);
    }

    const generateMoveAssignment = (assignment: Assignment) => {
        generateMoveExpression(assignment.expression);
        const name = getVariableName(assignment.variable);
        push(
            ...tableAssignmentCommands[assignment.operator].map(c => c.replace("__var__", name)),
            `mov eax, ${name}`
        );
    }

    const generateMoveBinary = (binaryExpression: BinaryExpression) => {
        generateMoveExpression(binaryExpression.leftOperand);
        push("push eax");
        generateMoveExpression(binaryExpression.rightOperand);
        push(
            "mov ebx, eax",
            "pop eax",
            ...tableBinaryCommands[binaryExpression.operator]
        );
    }

    const generateMoveUnary = (unaryExpression: UnaryExpression) => {
        generateMoveExpression(unaryExpression.operand);
        push(...tableUnaryCommands[unaryExpression.operator]);
    }

    const generateMoveConstant = (constant: Constant) => {
        push(`mov eax, ${constant.value}`);
    }

    const generateMoveVariable = (variable: Variable) => {
        push(`mov eax, ${getVariableName(variable)}`);
    }

    const generateMoveFunctions = {
        [FunctionCall.name]: generateMoveFunctionCall,
        [Assignment.name]: generateMoveAssignment,
        [BinaryExpression.name]: generateMoveBinary,
        [UnaryExpression.name]: generateMoveUnary,
        [Constant.name]: generateMoveConstant,
        [Variable.name]: generateMoveVariable
    } as Readonly<Record<string, ((expression: Expression) => void) | undefined>>;

    const generateMoveExpression = (expression: Expression) => {
        const generateMoveFunction = generateMoveFunctions[expression.constructor.name];
        if (generateMoveFunction === undefined) {
            throw new UnknownNodeError(expression);
        }
        generateMoveFunction(expression);
    }


    const generateFunction = (function_: Function_) => {
        push(`${getFunctionName(function_)} PROC`);
        ++depth;
        function_.variables.forEach(v => push(`LOCAL ${getVariableName(v)}: DWORD`));
        function_.parameters.reverse().forEach((v, i) => push(
            `mov eax, ${getParameterName(i)}`,
            `mov ${getVariableName(v)}, eax`
        ));
        generateBlock(function_.block);

        if (function_.name === "main") {
            push(
                "INVOKE StdIn, addr end_input, 1",
                `INVOKE ExitProcess, 0`
            );
        }

        --depth;
        push(
            `${getFunctionName(function_)} ENDP`,
            "",
            ""
        );
    }


    code = "";
    depth = 0;
    functions.forEach(generateFunction);
    const functionCode = code;

    code = "";
    depth = 1;
    const numberParameters = Math.max(...functions.map(f => f.parameters.length));
    for (let i = 0; i < numberParameters; ++i) {
        push(`${getParameterName(i)} DWORD 0`);
    }
    const parametersDataCode = code;

    return template.replace("__code__", functionCode).replace("__parameters__", parametersDataCode);
}


const getParameterName = (index: number) => `parameter_${index}`;

const getFunctionName = (function_: Function_ | string) => {
    const name = typeof (function_) === "string" ? function_ : function_.name;
    return `function_${name}`;
}

const getVariableName = (variable: Variable) => `var_${variable.name}_${variable.blockId}`;

const t = (depth: number) => "  ".repeat(depth);

const tableAssignmentCommands = {
    [AssignmentOperator.Empty]: ["mov __var__, eax"],
    [AssignmentOperator.Add]: ["add __var__, eax"],
    [AssignmentOperator.Sub]: ["sub __var__, eax"],
    [AssignmentOperator.Mul]: [
        "mov ebx, __var__",
        "imul ebx, eax",
        "mov __var__, ebx"
    ],
    [AssignmentOperator.Div]: [
        "mov ebx, eax",
        "mov eax, __var__",
        "cdq",
        "idiv ebx",
        "mov __var__, eax"
    ],
    [AssignmentOperator.Mod]: [
        "mov ebx, eax",
        "mov eax, __var__",
        "cdq",
        "idiv ebx",
        "mov __var__, edx"
    ]
} as Readonly<Record<AssignmentOperator, string[]>>;

const tableUnaryCommands = {
    [UnaryOperator.Plus]: [],
    [UnaryOperator.Minus]: ["neg eax"]
} as Readonly<Record<UnaryOperator, string[]>>;

const getIfCommands = (operator: string) => [
    `.IF SDWORD PTR eax ${operator} ebx`,
    `${t(1)}mov eax, 1`,
    ".ELSE",
    `${t(1)}mov eax, 0`,
    ".ENDIF"
]
const tableBinaryCommands = {
    [BinaryOperator.Add]: ["add eax, ebx"],
    [BinaryOperator.Sub]: ["sub eax, ebx"],
    [BinaryOperator.Mul]: ["imul eax, ebx"],
    [BinaryOperator.Div]: [
        "cdq",
        "idiv ebx"
    ],
    [BinaryOperator.Mod]: [
        "cdq",
        "idiv ebx",
        "mov eax, edx"
    ],
    [BinaryOperator.Equal]: getIfCommands("=="),
    [BinaryOperator.NotEqual]: getIfCommands("!="),
    [BinaryOperator.Greater]: getIfCommands(">"),
    [BinaryOperator.GreaterOrEqual]: getIfCommands(">="),
    [BinaryOperator.Less]: getIfCommands("<"),
    [BinaryOperator.LessOrEqual]: getIfCommands("<="),
    [BinaryOperator.And]: ["and eax, ebx"],
    [BinaryOperator.Or]: ["or eax, ebx"]
} as Readonly<Record<BinaryOperator, string[]>>;

const template = `.386
.model flat, stdcall
option casemap:none


includelib kernel32.lib
includelib masm32.lib
include kernel32.inc
include masm32.inc


.data
${t(1)}end_input BYTE 2 dup(?)
${t(1)}int_buffer BYTE 12 dup(?)
${t(1)}new_line BYTE 0Ah, 0
__parameters__

.code


__code__end ${getFunctionName("main")}`;


export default generate;