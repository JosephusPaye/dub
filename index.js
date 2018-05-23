#!/usr/bin/env node
const sade = require('sade');
const rename = require('./commands/rename');

const prog = sade('dub');
prog.version('0.1.0');

prog.command('rename <from> <to>')
    .describe('Rename files matching the <from> pattern to new names derived from the <to> template.')
    .option('-d, --dry', 'Perform a dry run. Shows the result of `dub rename` without actually renaming any files.')
    .option('-e, --regex', 'Match <from> as a JS regular expression. By default, <from> is matched as a glob pattern.')
    .example('rename "*.jpeg" "{1}.jpg"')
    .action(rename);

prog.parse(process.argv);
