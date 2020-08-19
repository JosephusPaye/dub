# Dub

Quickly rename multiple files from the command line, using a glob or regular expression, with support for variable substitution and automatic case transformation.

This project is part of [#CreateWeekly](https://dev.to/josephuspaye/createweekly-create-something-new-publicly-every-week-in-2020-1nh9), my attempt to create something new publicly every week in 2020.

## Installation

```
npm install @josephuspaye/dub --global
```

## Examples

The following examples change all matching files in the current directory.

### Rename all PDF files to [title case](https://en.wikipedia.org/wiki/Letter_case#Title_case)

```sh
dub "*.pdf" "{1:title}.pdf"
```

| Before                                                  | After                                                   |
| :------------------------------------------------------ | :------------------------------------------------------ |
| `final_projectReport.pdf`                               | `Final Project Report.pdf`                              |
| `The_School_Based_Lived_Experiences_of_Adolescents.pdf` | `The School Based Lived Experiences of Adolescents.pdf` |

More case transformations are available. See [Case transformation of variables](#case-transformation-of-variables) below.

### Change the extension of all `.jpeg` files to `.jpg`

```sh
dub "*.jpeg" "{1}.jpg"
```

| Before                                       | After                                       |
| :------------------------------------------- | :------------------------------------------ |
| `WhatsApp-Image-2019-05-07-at-16.01.31.jpeg` | `WhatsApp-Image-2019-05-07-at-16.01.31.jpg` |
| `twitter-avatar.jpeg`                        | `twitter-avatar.jpg`                        |

### Rename all subtitle files to show they're in English

```sh
dub "*.srt" "{1}.eng.srt"
```

| Before                                          | After                                               |
| :---------------------------------------------- | :-------------------------------------------------- |
| `Westworld - S03E03 - The Absence of Field.srt` | `Westworld - S03E03 - The Absence of Field.eng.srt` |
| `Westworld - S03E08 - Crisis Theory.srt`        | `Westworld - S03E08 - Crisis Theory.eng.srt`        |

### Number all files, padded to three digits

```sh
dub "*" "{00i} - {1}"
```

| Before             | After                    |
| :----------------- | :----------------------- |
| `Report 2016.xlsx` | `001 - Report 2016.xlsx` |
| `Report 2017.xlsx` | `002 - Report 2017.xlsx` |
| `Report 2018.xlsx` | `003 - Report 2018.xlsx` |

### Remove the word "draft" from the name of all files

```sh
dub "*draft*" "{1}{2}"
```

| Before                                | After                           |
| :------------------------------------ | :------------------------------ |
| `Quarterly earnings draft report.pdf` | `Quarterly earnings report.pdf` |
| `Assignment 3 draft.docx`             | `Assignment 3.docx`             |

## Usage

```
Description
  Rename files matching the <from> pattern to new names derived from the <to> template.
  Run `npm repo @josephuspaye/dub` for details.

Usage
  $ dub <from> <to> [options]

Options
  -d, --dry        Performs a dry run. Will show what the renamed files will be without actually renaming any files.
  -e, --regex      Matches <from> as a JS regular expression (excluding // delimiters). By default, <from> is matched as a glob pattern.
  -f, --files      Matches files only. By default, both files and directories are matched.
  -i, --dirs       Matches directories only. By default, both files and directories are matched.
  -v, --version    Displays current version
  -h, --help       Displays this message

Examples
  $ dub "*.jpg" "{00i} {1}.jpg"
  $ dub "*.srt" "{1}.eng.srt"
  $ dub "*.mp4" "{1:title}.mp4"
```

### `<from>` pattern

`<from>` defines a pattern that is used to match files to rename. The pattern can be a [glob](<https://en.wikipedia.org/wiki/Glob_(programming)>) or [JavaScript regular expression](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions) (using the `--regex` option).

When using a glob, the match of each wildcard is captured, and can be substituted as a variable in the `<to>` template. For example, the pattern `*-*.txt` will match all text files with a hyphen in their name. Everything before the hyphen will be captured as the variable `1`, and everything after will be captured as `2`. These can be substituted as `{1}` and `{2}` respectively in the template.

When using a regular expression, the result of capturing groups can be substituted as a variables in the `<to>` template. The result of the first capturing group will be the variable `1`, the second will be `2`, the third will be `3`, etc. These can be substituted as `{1}`, `{2}`, `{3}`, etc respectively in the template.

### `<to>` template

`<to>` defines a template with zero or more variables that is used to generate the new file names. Variables captured from the `<from>` pattern can be used in the template by wrapping their names in `{` and `}`. When the files are renamed, those variables are replaced with the string matched in the original file name.

For example, given a file named `the best way to predict the future is to invent it.txt`, a `<from>` pattern of `* best * invent *` will match the file and capture the following variables:

| Name | Value                             |
| :--- | :-------------------------------- |
| `1`  | `the`                             |
| `2`  | `way to predict the future is to` |
| `3`  | `it.txt`                          |

Using the above with the `<to>` template `{1} easiest {2} prevent {3}` will result in the new name `the easiest way to predict the future is to prevent it.txt`.

#### Counter variables

The special variable `i` can be used to insert a counter, which will start at 1 and go up to the number of files being renamed. When using the counter variable, the letter `i` can be prefixed with any number of zeroes to indicate that the counter should be zero-padded.

For example, the template `{00i}` will produce `001`, `002`, `003`, ..., `010`, `011`, `012`, ..., `100`, `101`, `102`, etc.

#### Case transformation of variables

The casing of matched variables (excluding counter variables) can be changed. This is done by adding a `:` followed by the name of the case to change to. For example `{1:upper}` will change the value of the variable `1` to upper case.

The following cases are available:

| Case       | Description                                                                                                                                                          |
| :--------- | :------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `camel`    | Changes the text into a string with the separator denoted by the next word capitalized. <br>Example: `Brienne Of Tarth` → `brienneOfTarth`                           |
| `capital`  | Changes the text into a space separated string with each word capitalized. <br>Example: `Brienne Of Tarth` → `Brienne Of Tarth`                                      |
| `dot`      | Changes the text into a lower case string with a period between words. <br>Example: `Brienne Of Tarth` → `brienne.of.tarth`                                          |
| `header`   | Changes the text into a dash separated string of capitalized words. <br>Example: `Brienne Of Tarth` → `Brienne-Of-Tarth`                                             |
| `kebab`   | Changes the text into a dash separated string of lower cased words. <br>Example: `Brienne Of Tarth` → `brienne-of-tarth`                                             |
| `lower`    | Changes the text to lower case. <br>Example: `Brienne Of Tarth` → `brienne of tarth`                                                                                 |
| `pascal`   | Changes the text into a string of capitalized words without separators. <br>Example: `Brienne Of Tarth` → `BrienneOfTarth`                                           |
| `sentence` | Changes the text into lower case with spaces between words, then capitalizes the string. <br>Example: `Brienne Of Tarth` → `Brienne of tarth`                        |
| `snake`    | Changes the text into a lower case string with underscores between words. <br>Example: `Brienne Of Tarth` → `brienne_of_tarth`                                       |
| `sponge`   | Changes the text to sponge case (random capitalization). <br>Example: `Brienne Of Tarth` → `bRIEnNE oF TarTh`                                                        |
| `swap`     | Changes the text by changing lower case letters into upper case, and vice-versa. <br>Example: `Brienne Of Tarth` → `bRIENNE oF tARTH`                                |
| `title`    | Changes the text to [title case](https://en.wikipedia.org/wiki/Letter_case#Title_case) following English rules. <br>Example: `Brienne Of Tarth` → `Brienne Of Tarth` |
| `upper`    | Changes the text to upper case. <br>Example: `Brienne Of Tarth` → `BRIENNE OF TARTH`                                                                                 |

## Licence

[MIT](LICENCE)
