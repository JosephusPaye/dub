#!/usr/bin/env node
const sade = require('sade');

const { renameCommand } = require('./rename');
const { version } = require('./package.json');

const program = sade('dub <from> <to>')
    .version(version)
    .describe([
        'Rename files matching the <from> pattern to new names derived from the <to> template.',
        'Run `npm repo @josephuspaye/dub` for details.',
    ])
    .option(
        '-d, --dry',
        'Performs a dry run. Will show what the renamed files will be without actually renaming any files.'
    )
    .option(
        '-e, --regex',
        'Matches <from> as a JS regular expression (excluding // delimiters). By default, <from> is matched as a glob pattern.'
    )
    .option(
        '-f, --files',
        'Matches files only. By default, both files and directories are matched.'
    )
    .option(
        '-i, --dirs',
        'Matches directories only. By default, both files and directories are matched.'
    )
    .example('"*.jpg" "{00i} {1}.jpg"')
    .example('"*.srt" "{1}.eng.srt"')
    .example('"*.mp4" "{1:title}.mp4"')
    .action(renameCommand);

program.parse(process.argv);
