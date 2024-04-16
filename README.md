# ltr

A simple command-line text segmenter that uses the [`Intl.Segmenter`](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Intl/Segmenter) <abbr>API</abbr> to split text into characters, words and sentences.

It takes cues from standard Unix command-line tools such as [`wc`](https://en.wikipedia.org/wiki/Wc_(Unix)), [`uniq`](https://en.wikipedia.org/wiki/Uniq), and [`sort`](https://en.wikipedia.org/wiki/Sort_(Unix)).

## Getting started

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

`ltr` accepts one or more input files, or uses the standard input (`stdin`) when no files are provided. You can also concatenate `stdin` to other input files by using the `-` (dash) operand.

General options:
* __`-h`__, __`--help`__.
* __`-v`__, __`--version`__.

Available commands:

* `ltr chars` — extract graphemes;
* `ltr words` — extract words;
* `ltr sentences` — extract sentences.

The tool returns one value per line.

## Options

### `-l`, `--locale`

By default, `ltr` works with the current locale. An explicit locale can be specified.

```bash
ltr sentences --locale=ro my-doc.txt
```

### `-u`, `--unique`

Return unique values, removing any duplicates.

```bash
ltr words --unique my-doc.txt
```

### `-i`, `--ignore-case`

Ignore case when performing operations. Causes values to be returned in lowercase.

```bash
ltr words --ignore-case my-doc.txt
```

### `-I`, `--ignore-accents`

Ignore diacritical marks when performing operations. Causes values to be returned without diacritical marks.

```bash
ltr words --ignore-accents my-doc.txt
```

### `-c`, `--count`

Count occurences of each unique value.

```bash
ltr words --count my-doc.txt
```

### `-t`, `--total`

Count total occurrences. The option implies `--count`.

```bash
ltr words --total my-doc.txt
```

### `-s`, `--sort`

Sort the values. 

```bash
ltr words --sort my-doc.txt
```

When `--count` is present, values are sorted by occurrences, from most frequent to least. Otherwise values are sorted alphabetically in ascending order.

### `-r`, `--reverse`

Reverse the order of the values. It can be used to reverse the sorting order, but can also be used on its own to list values in the reverse order of occurrence. 

```bash
ltr words --sort --reverse my-doc.txt
```

## Working with HTML and Markdown

Although you can feed HMTL and Markdown to `ltr`, the list of returned value will have the added noise of markup constructs.

You can convert HTML or Markdown to plain text with [`trimd`](https://github.com/danburzo/trimd/) before calling `ltr`:

```bash
# Using Markdown:
trimd demarkdown my-post.md | ltr words --count --total

# Using HTML:
trimd demarkup my-page.html | ltr words --count --total
```

Furhtermore, when using HTML documents you may want to focus on the main part of the content to reduce the interference of ancillary page content. You can use [`hred`](https://github.com/danburzo/hred/) to extract the content of a single element:

```bash
# Using HTML, just the <main> content:
cat my-page.html | trimd demarkup | ltr words --count --total
```