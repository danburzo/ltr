#!/usr/bin/env node

import { readFile } from 'node:fs/promises';
import opsh from 'opsh';

const booleanOpts = ['h', 'help', 'v', 'version', 'u', 'unique', 'i', 'ignore-case', 'I', 'ignore-accents', 'c', 'count', 'r', 'reverse', 's', 'sort'];

const args = opsh(process.argv.slice(2), booleanOpts);
const commands = ['chars', 'words', 'sentences'];

// Use the STDIN operand when none provided.
const [command, ...operands] = [...args.operands];
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

if (!command || commands.indexOf(command) === -1) {
	console.error(`Expecting a command, one of: ${commands.join(', ')}`);
	process.exit(1);
}

function segmenter(command, locale) {
	const GRANULARITIES = {
		'chars': 'grapheme',
		'words': 'word',
		'sentences': 'sentence'
	};
	const segmenter = new Intl.Segmenter(locale, {
		granularity: GRANULARITIES[command]
	});
	const ALL_WS = /^\s*$/
	const filter_fn = command === 'words' ? s => s.isWordLike && !ALL_WS.test(s.segment) : s => !ALL_WS.test(s.segment);
	return function(txt) {
		return [...segmenter.segment(txt)]
			.filter(filter_fn)
			.map(s => s.segment.trim());
	}
}

function counter(segments, sort) {
	const dict = {};
	let results = segments
		.filter(s => {
			if (dict[s] === undefined) {
				dict[s] = 1;
				return true;
			}
			dict[s] += 1;
			return false;
		});

	if (sort) {
		results = results.sort((a, b) => dict[b] - dict[a]);
	}

	return results.map(s => `${s}\t${dict[s]}`);
}

function unique(arr, compare) {
	return [...new Set(arr)];
}

// See: https://en.wikipedia.org/wiki/Combining_Diacritical_Marks
function basechars(str) {
	return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
};

function aggregator(options) {
	const should_sort = options.s || options.sort;
	const should_count = options.c || options.count;
	const collator = new Intl.Collator(options.l || options.locale);

	return function(segments) {
		if (options.I || options['ignore-accents']) {
			segments = segments.map(s => basechars(s));
		}
		if (options.i || options['ignore-case']) {
			segments = segments.map(s => s.toLowerCase());
		}
		if (should_sort && !should_count) {
			/*
				If counting, sorting by frequency 
				happens _after_ the count.
			*/
			segments = segments.sort(collator.compare);
		}
		if (should_count) {
			segments = counter(segments, should_sort);
		} else if (options.u || options.unique) {
			segments = unique(segments);
		}
		if (options.r || options.reverse) {
			segments = segments.reverse();
		}
		return segments.join('\n');
	}
}

const data = await Promise.all(
	operands.map(
		it => it === '-' ? slurp(process.stdin) : readFile(it, 'utf8')
	)
);

const result = data
	.map(segmenter(command, args.options.l || args.options.locale))
	.map(aggregator(args.options))
	.join('\n');

console.log(result);

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
  
    ltr [command] [options] [file1, [file2, ...]]

    Operands are one or more files provided by file path.
    Using '-' (dash) as an operand reads from the standard input (STDIN).
    When no operands are provided, input is read from STDIN.

    Output is provided to the standard output (STDOUT).

General options:

    -h, --help
        Output help information.

    -v, --version
        Output program version.

Commands:
	
    chars
        Split the input into characters (graphemes).

    words
        Split the input into words.

    sentences
        Split the input into sentences.

Options:

    -l <locale>, --locale=<locale>
        Provide an explicit locale.
    
    -u, --unique
    	Return unique values, 
    	with any duplicates removed.

    -i, --ignore-case
    	Ignore the case in operations.
    	All values are returned in lowercase.

    -I, --ignore-accents
    	Ignore diacritical marks in operations.
    	All values are returned without diacritical marks.

    -c, --count
    	Count occurrences of each value.

    -s, --sort
    	Sorts the values. 
    	If "--count" is present, sorts by count,
    	otherwise sorts by value.

    -r, --reverse
    	Reverse the order of values.

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
