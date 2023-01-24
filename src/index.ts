import { readFile, writeFile } from "fs/promises";
import { createInterface, Interface } from "readline";
import { stdin as input, stdout as output } from "process";
import { basename, extname, dirname, join } from "path";
import { scan } from "@scanner";
import { parse } from "@parser";
import { generate } from "@generator";


const question = async (interface_: Interface, query: string) => new Promise<string>(resolve => interface_.question(query, resolve));

const main = async () => {
    const interface_ = createInterface({ input, output });

    const path = await question(interface_, "Enter the path to the file: ");
    const name = basename(path, extname(path));
    const dir = dirname(path);
    const code = (await readFile(path)).toString();

    const tokens = Array(...scan(code));
    await writeFile(join(dir, `${name}-tokens.txt`), tokens.map(t => `${t}\n`));

    const ast = parse(tokens);
    await writeFile(join(dir, `${name}-ast.txt`), ast.reduce((prev, f) => prev += f.toString(), ""));

    const masmCode = generate(ast);
    await writeFile(join(dir, `${name}.asm`), masmCode);

    await question(interface_, "Success! Enter any character: ");
    interface_.close();
}

main().catch(reason => console.log(reason));