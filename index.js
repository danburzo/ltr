#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import opsh from 'opsh';

const args = opsh(process.argv.slice(2), ['h', 'help', 'v', 'version']);

// Use the STDIN operand when none provided.
const operands = [...args.operands];
if (!operands.length) {
	operands.push('-');
}

if (args.options.h || args.options.help) {
	await outputHelp();
	process.exit();
}

if (args.options.v || args.options.version) {
	const pkg = await getPackage();
	console.log(pkg.version);
	process.exit();
}

const results = await Promise.all(
	operands
		.map(it => (it === '-' ? slurp(process.stdin) : readFile(it, 'utf8')))
);

console.log(results);

async function getPackage() {
	return JSON.parse(
		await readFile(new URL('./package.json', import.meta.url))
	);
}

async function outputHelp() {
	const pkg = await getPackage();
	console.log(`${pkg.name} ${pkg.version}`);
	console.log(`${pkg.description}`);
	console.log(`Homepage: ${pkg.homepage}`);

	console.log(`
Usage:
  
    ltr [options] [file1, [file2, ...]]

    Operands are one or more files provided by file path.
    Using '-' (dash) as an operand reads from the standard input (STDIN).
    When no operands are provided, input is read from STDIN.

    Output is provided to the standard output (STDOUT).

General options:

    -h, --help
        Output help information.

    -v, --version
        Output program version.

Options:
Examples:

`);
}

async function slurp(stream) {
	let arr = [], len = 0;
	for await (let chunk of stream) {
		arr.push(chunk);
		len += chunk.length;
	}
	return Buffer.concat(arr, len).toString();
}
