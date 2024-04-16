# ltr

A simple command-line text segmenter that uses the [`Intl.Segmenter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter) <abbr>API</abbr> to split text into characters, words and sentences.

It takes cues from standard Unix command-line tools such as [`wc`](https://en.wikipedia.org/wiki/Wc_(Unix)), [`uniq`](https://en.wikipedia.org/wiki/Uniq), and [`sort`](https://en.wikipedia.org/wiki/Sort_(Unix)).

## Installation

`ltr` runs in Node.js and can be installed globally with npm:

```bash
npm install -g ltr
```

You can also run it without installing it first, using npx:

```bash
npx ltr --help
```

## Usage

```bash
ltr [command] [file1, [file2, …]]
```

General options:
* __`-h`__, __`--help`__.
* __`-v`__, __`--version`__.

Available commands:

* `ltr chars` — extract graphemes;
* `ltr words` — extract words;
* `ltr sentences` — extract sentences.

## Options

### `-l`, `--locale`

By default, `ltr` works with the current locale. An explicit locale can be specified.

```bash
ltr sentences --locale=ro my-doc.txt
```

### `-u`, `--unique`

Return unique values, removing any duplicates.

### `-i`, `--ignore-case`

Ignore case when performing operations. Causes values to be returned in lowercase.

### `-I`, `--ignore-accents`

Ignore diacritical marks when performing operations. Causes values to be returned without diacritical marks.

### `-c`, `--count`

Count occurences of each unique value.

### `-s`, `--sort`

Sort the values. 

When `--count` is present, values are sorted by occurrences, from most frequent to least. Otherwise values are sorted alphabetically in ascending order.

### `-r`, `--reverse`

Reverse the order of the values.
