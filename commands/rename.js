const chalk = require('chalk');
const globToRegex = require('glob-to-regexp');
const inquirer = require('inquirer');

const { getFilenames, rename, renameAll } = require('../support/fs');
const { getVariables, compile } = require('../support/template');

async function renameCommand(pattern, template, opts) {
    const variables = getVariables(template);
    let patternRegex;

    try {
        patternRegex = opts.regex ? new RegExp(pattern) : globToRegex(pattern, { extended: true });
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
                to: compile(template, variables, matches, index + 1)
            };
        });

    if (transformations.length === 0) {
        console.log(`No matching files found in the current directory`);
        return;
    }

    const diff = transformations.map(file => {
        return chalk.red('- ' + file.from) + '\n' + chalk.green('+ ' + file.to);
    });

    // Print the diff
    console.log(diff.join('\n\n'));

    // Abort if this is a dry run
    if (opts.dry) {
        return;
    }

    const question = {
        type: 'confirm',
        name: 'renameConfirmed',
        message: 'Perform the renames shown above?',
        default: false
    };

    console.log('\n');

    const { renameConfirmed } = await inquirer.prompt([question]);

    if (renameConfirmed) {
        renameAll(transformations, process.cwd()).then(() => {
            console.log('Files renamed');
        });
    }
}

module.exports = renameCommand;
