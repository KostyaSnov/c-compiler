# Subset C compiler

The compiler for a subset of the C programming language into MASM.

## Features

- Variables of the `int` type.
- The unary operators: `+`, `-`.
- The binary operators: `+`, `-`, `*`, `/`, `%`, `==`, `!=`, `>`, `>=`, `<`, `<=`, `&&`, `||`.
- The assignment expressions: `=`, `+=`, `-=`, `*=`, `/=`, `%=`.
- An `if` statement.
- A `while` statement.
- Functions, including recursive ones.
- Blocks with variable scopes.
- Input and output of `int` type numbers using built-in `stdin` and `stdout`.
- Single line comments.
- Ignoring preprocessor directives beginning with `#`.
- If a source code contains a syntax or semantic error, an error will be thrown.

## Getting started

- Install packages with command `npm i`.
- Build an executable with command `npm start`.
- Run *c-compiler.exe* from *dist* directory.
- Enter a path to a subset C source file and continue.
- The following files will be created along with the source file:
    - _*-tokens.txt_ - tokens of the source code.
    - _*-ast.txt_ - an abstract syntax tree of the source code.
    - _*.asm_ - a MASM code.
- Compile the MASM code using the [MASM32 SDK](https://www.masm32.com).

## Example

<details>
<summary>Source code</summary>

```C
#include <stdio.h>
#define stdout(x) printf("%d\n", x)
#define stdin(x) scanf("%d", &x)


int calculate_recursive_factorial(int n) {
    if (n == 0) return 1;
    return n * calculate_recursive_factorial(n - 1);
}

int calculate_iterative_factorial(int n) {
    int factorial = 1;
    while (n > 1) {
        factorial *= n;
        n -= 1;
    }
    return factorial;
}

int main() {
    int n;
    stdin(n);
    stdout(calculate_recursive_factorial(n));
    stdout(calculate_iterative_factorial(n));
}

```

</details>

<details>
<summary>Tokens</summary>

```Text
"int" (row 6, column 1)
Identifier calculate_recursive_factorial (row 6, column 5)
"(" (row 6, column 34)
"int" (row 6, column 35)
Identifier n (row 6, column 39)
")" (row 6, column 40)
"{" (row 6, column 42)
"if" (row 7, column 5)
"(" (row 7, column 8)
Identifier n (row 7, column 9)
"==" (row 7, column 11)
Integer 0 (row 7, column 14)
")" (row 7, column 15)
"return" (row 7, column 17)
Integer 1 (row 7, column 24)
";" (row 7, column 25)
"return" (row 8, column 5)
Identifier n (row 8, column 12)
"*" (row 8, column 14)
Identifier calculate_recursive_factorial (row 8, column 16)
"(" (row 8, column 45)
Identifier n (row 8, column 46)
"-" (row 8, column 48)
Integer 1 (row 8, column 50)
")" (row 8, column 51)
";" (row 8, column 52)
"}" (row 9, column 1)
"int" (row 11, column 1)
Identifier calculate_iterative_factorial (row 11, column 5)
"(" (row 11, column 34)
"int" (row 11, column 35)
Identifier n (row 11, column 39)
")" (row 11, column 40)
"{" (row 11, column 42)
"int" (row 12, column 5)
Identifier factorial (row 12, column 9)
"=" (row 12, column 19)
Integer 1 (row 12, column 21)
";" (row 12, column 22)
"while" (row 13, column 5)
"(" (row 13, column 11)
Identifier n (row 13, column 12)
">" (row 13, column 14)
Integer 1 (row 13, column 16)
")" (row 13, column 17)
"{" (row 13, column 19)
Identifier factorial (row 14, column 9)
"*=" (row 14, column 19)
Identifier n (row 14, column 22)
";" (row 14, column 23)
Identifier n (row 15, column 9)
"-=" (row 15, column 11)
Integer 1 (row 15, column 14)
";" (row 15, column 15)
"}" (row 16, column 5)
"return" (row 17, column 5)
Identifier factorial (row 17, column 12)
";" (row 17, column 21)
"}" (row 18, column 1)
"int" (row 20, column 1)
Identifier main (row 20, column 5)
"(" (row 20, column 9)
")" (row 20, column 10)
"{" (row 20, column 12)
"int" (row 21, column 5)
Identifier n (row 21, column 9)
";" (row 21, column 10)
"stdin" (row 22, column 5)
"(" (row 22, column 10)
Identifier n (row 22, column 11)
")" (row 22, column 12)
";" (row 22, column 13)
"stdout" (row 23, column 5)
"(" (row 23, column 11)
Identifier calculate_recursive_factorial (row 23, column 12)
"(" (row 23, column 41)
Identifier n (row 23, column 42)
")" (row 23, column 43)
")" (row 23, column 44)
";" (row 23, column 45)
"stdout" (row 24, column 5)
"(" (row 24, column 11)
Identifier calculate_iterative_factorial (row 24, column 12)
"(" (row 24, column 41)
Identifier n (row 24, column 42)
")" (row 24, column 43)
")" (row 24, column 44)
";" (row 24, column 45)
"}" (row 25, column 1)
" " (row 26, column 1)
```

</details>

<details>
<summary>Abstract syntax tree</summary>

```Text
Function calculate_recursive_factorial:
    Variable n_1
    Block:
        If:
            BinaryExpression Equal:
                Variable n_1
                Constant 0
            Return:
                Constant 1
        Return:
            BinaryExpression Mul:
                Variable n_1
                FunctionCall calculate_recursive_factorial:
                    BinaryExpression Sub:
                        Variable n_1
                        Constant 1
Function calculate_iterative_factorial:
    Variable n_1
    Block:
        Declaration:
            Variable factorial_1
            Constant 1
        While:
            BinaryExpression Greater:
                Variable n_1
                Constant 1
            Block:
                Assignment Mul:
                    Variable factorial_1
                    Variable n_1
                Assignment Sub:
                    Variable n_1
                    Constant 1
        Return:
            Variable factorial_1
Function main:
    Block:
        Declaration:
            Variable n_1
        Stdin:
            Variable n_1
        Stdout:
            FunctionCall calculate_recursive_factorial:
                Variable n_1
        Stdout:
            FunctionCall calculate_iterative_factorial:
                Variable n_1
```

</details>

<details>
<summary>MASM code</summary>

```Assembly
.386
.model flat, stdcall
option casemap:none


includelib kernel32.lib
includelib masm32.lib
include kernel32.inc
include masm32.inc


.data
  end_input BYTE 2 dup(?)
  int_buffer BYTE 12 dup(?)
  new_line BYTE 0Ah, 0
  parameter_0 DWORD 0


.code


function_calculate_recursive_factorial PROC
  LOCAL var_n_1: DWORD
  mov eax, parameter_0
  mov var_n_1, eax
  mov eax, var_n_1
  push eax
  mov eax, 0
  mov ebx, eax
  pop eax
  .IF SDWORD PTR eax == ebx
    mov eax, 1
  .ELSE
    mov eax, 0
  .ENDIF
  .IF eax
    mov eax, 1
    RET
  .ENDIF
  mov eax, var_n_1
  push eax
  mov eax, var_n_1
  push eax
  mov eax, 1
  mov ebx, eax
  pop eax
  sub eax, ebx
  mov parameter_0, eax
  INVOKE function_calculate_recursive_factorial
  mov ebx, eax
  pop eax
  imul eax, ebx
  RET
function_calculate_recursive_factorial ENDP


function_calculate_iterative_factorial PROC
  LOCAL var_n_1: DWORD
  LOCAL var_factorial_1: DWORD
  mov eax, parameter_0
  mov var_n_1, eax
  mov eax, 1
  mov var_factorial_1, eax
  mov eax, var_n_1
  push eax
  mov eax, 1
  mov ebx, eax
  pop eax
  .IF SDWORD PTR eax > ebx
    mov eax, 1
  .ELSE
    mov eax, 0
  .ENDIF
  .WHILE eax
    mov eax, var_n_1
    mov ebx, var_factorial_1
    imul ebx, eax
    mov var_factorial_1, ebx
    mov eax, var_factorial_1
    mov eax, 1
    sub var_n_1, eax
    mov eax, var_n_1
    mov eax, var_n_1
    push eax
    mov eax, 1
    mov ebx, eax
    pop eax
    .IF SDWORD PTR eax > ebx
      mov eax, 1
    .ELSE
      mov eax, 0
    .ENDIF
  .ENDW
  mov eax, var_factorial_1
  RET
function_calculate_iterative_factorial ENDP


function_main PROC
  LOCAL var_n_1: DWORD
  INVOKE StdIn, addr int_buffer, 11
  INVOKE atol, addr int_buffer
  mov var_n_1, eax
  mov eax, var_n_1
  mov parameter_0, eax
  INVOKE function_calculate_recursive_factorial
  INVOKE dwtoa, eax, addr int_buffer
  INVOKE StdOut, addr int_buffer
  INVOKE StdOut, addr new_line
  mov eax, var_n_1
  mov parameter_0, eax
  INVOKE function_calculate_iterative_factorial
  INVOKE dwtoa, eax, addr int_buffer
  INVOKE StdOut, addr int_buffer
  INVOKE StdOut, addr new_line
  INVOKE StdIn, addr end_input, 1
  INVOKE ExitProcess, 0
function_main ENDP


end function_main
```

</details>

<details>
<summary>Compilation</summary>

The compilation script for the [MASM32 SDK](https://www.masm32.com):

```Batchfile
setlocal

set SOURCE_FILE_PATH=example.asm
set MASM_SDK_PATH=masm32

"%MASM_SDK_PATH%\bin\ml" ^
    /I "%MASM_SDK_PATH%\include" ^
    /c ^
    /coff ^
    "%SOURCE_FILE_PATH%"
"%MASM_SDK_PATH%\bin\link" ^
    /LIBPATH:"%MASM_SDK_PATH%\lib" ^
    /SUBSYSTEM:CONSOLE ^
    "%SOURCE_FILE_PATH:.asm=.obj%"

endlocal

```

Built [example.exe](https://github.com/KostyaSnov/c-compiler/releases/download/1.0.0/example.exe) is
attached to release 1.0.0.
</details>
