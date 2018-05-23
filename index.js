#!/usr/bin/env node
const sade = require('sade');
const rename = require('./commands/rename');

const prog = sade('dub');
prog.version('0.1.0');

prog.command('rename <src> <dest>')
    .describe('Rename files matching the src pattern to the dest name.', 'dest is a template, use @1, @2, ..., @n to insert matched regions.')
    .option('-d, --dry', 'Do a dry run. Shows the result of `dub rename` without actually renaming any files.')
    .option('-e, --regex', 'Match src as a JS regular expression. By default, src is matched as a glob pattern.')
    .example('rename "*.jpeg" "@1.jpg"')
    .action(rename);

prog.parse(process.argv);
