const changeCase = require('change-case');

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

function compile(template, variables, matches, counter) {
    let output = template;

    variables.forEach(variable => {
        // Expand counters
        if (variable.type === 'counter') {
            output = output.replace(variable.match, String(counter).padStart(variable.width, '0'));
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

module.exports = {
    getVariables,
    compile
};
