const color = require('kleur');
const globToRegex = require('glob-to-regexp');
const { prompt } = require('enquirer');

const { getChildNames, renameAll } = require('./fs');
const { getVariables, compile } = require('./template');

exports.renameCommand = renameCommand;

async function renameCommand(pattern, template, opts) {
    const variables = getVariables(template);

    console.log(variables);

    let patternRegex;

    if (opts.regex) {
        try {
            patternRegex = new RegExp(pattern);
        } catch {
            console.log(
                color.red(
                    'Invalid <from> pattern: regular expression is invalid'
                )
            );
            return false;
        }
    } else {
        try {
            patternRegex = globToRegex(pattern, { extended: true });
        } catch {
            console.log(color.red('Invalid <from> pattern: glob is invalid'));
            return false;
        }
    }

    console.log('pattern', patternRegex);

    const currentDirectory = process.cwd();

    const targetType =
        opts.files && opts.dirs
            ? 'all'
            : opts.files
            ? 'files'
            : opts.dirs
            ? 'directories'
            : 'all';

    const names = await getChildNames(currentDirectory, targetType);

    const renames = names
        .filter((name) => patternRegex.test(name))
        .map((name, index) => {
            const matches = Array.from(name.match(patternRegex)).slice(1);

            return {
                from: name,
                to: compile(template, variables, matches, index + 1),
            };
        });

    if (renames.length === 0) {
        console.log(`No matching files found in the current directory`);
        return;
    }

    const diff = renames.map((file) => {
        return color.red('- ' + file.from) + '\n' + color.green('+ ' + file.to);
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
    };

    console.log('\n');

    const { renameConfirmed } = await prompt([question]);

    if (renameConfirmed) {
        function onError(err, name) {
            console.log(
                color.red(`Unable to rename: ${name.from} => ${name.to}`) +
                    ': (${err.message})'
            );
        }

        renameAll(renames, currentDirectory, onError).then(() => {
            console.log('Files renamed');
        });
    }
}
