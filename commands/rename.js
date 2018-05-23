const fs = require('fs');
const path = require('path');
const chalk = require('chalk');
const globToRegex = require('glob-to-regexp');
const changeCase = require('change-case');

async function rename(pattern, template, opts) {
    const variables = getVariables(template);
    let patternRegex;

    try {
        patternRegex = opts.regex ? new RegExp(pattern) : globToRegex(pattern);
    } catch (err) {
        console.log('Invalid src pattern');
        return;
    }

    const files = await getFilenames(process.cwd());

    const transformations = files.filter(f => patternRegex.test(f))
        .map((file, index) => {
            const matches = patternRegex.exec(file);

            return {
                from: file,
                to: evaluate(template, variables, matches, index)
            };
        });

    if (transformations.length === 0) {
        console.log(`No files found matching pattern: \`${pattern}\``);
        return;
    }

    // console.log(`> renaming from \`${pattern}\` to \`${template}\``);
    // console.log('> regex: ' + patternRegex.toString());
    // console.log(`> files: ${'\n  ' + files.join('\n  ')}`);
    // console.log('\n> transformations:\n');

    const output = [];

    transformations.forEach(f => {
        output.push(chalk.red('- ' + f.from) + '\n' + chalk.green('+ ' + f.to));
    });

    console.log(output.join('\n\n'));
}

function getFilenames(dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, names) => {
            if (err) {
                reject(err);
            }

            const files = names.filter(name => {
                return fs.statSync(path.join(dir, name)).isFile();
            });

            resolve(files);
        });
    });
}

const VARIABLES_REGEX = /{ *(\d*i) *}|{ *(\d+) *}|{ *(\d+:[ults]) *}/g;

function getVariables(string) {
    const matches = string.match(VARIABLES_REGEX);

    if (!matches) {
        return [];
    }

    return matches.map(match => {
        const inner = match.substring(1, match.length - 1).trim();

        // Handle counter variables
        if (inner.endsWith('i')) {
            return {
                type: 'counter',
                width: inner.length,
                match
            };
        }

        const variable = {
            type: 'variable',
            name: inner,
            match
        };

        if (inner.indexOf(':') == -1) {
            variable.hasTransform = false;
            return variable;
        }

        const [name, transform] = inner.split(':');

        const applyTransform = transform === 'u'
            ? changeCase.upperCase
            : transform === 'l'
                ? changeCase.lowerCase
                : transform === 't'
                    ? changeCase.titleCase
                    : changeCase.sentenceCase;

        return Object.assign(variable, {
            name,
            transform,
            applyTransform,
            hasTransform: true
        });
    });
}

function evaluate(template, variables, matches, index) {
    let output = template;

    variables.forEach(variable => {
        // Expand counters
        if (variable.type === 'counter') {
            output = output.replace(variable.match, String(index + 1).padStart(variable.width, '0'));
            return;
        }

        // Expand variables
        if (variable.type === 'variable') {
            const value = matches[Number(variable.name)];

            if (value) {
                const transformed = variable.hasTransform ? variable.applyTransform(value) : value;
                output = output.replace(variable.match, transformed);
            }
        }
    });

    return output;
}

module.exports = rename;
