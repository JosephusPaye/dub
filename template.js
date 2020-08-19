const changeCase = require('./change-case');

exports.getVariables = getVariables;
exports.compile = compile;

const caseTransformers = {};
for (const key of Object.keys(changeCase)) {
    const transform = key.replace('Case', '');
    caseTransformers[transform] = changeCase[key];
}

// https://regexr.com/5aaij
const VARIABLES_REGEX = /{ *(0*i) *}|{ *(\d+) *}|{ *(\d+:(camel|capital|dot|header|kebab|lower|pascal|sentence|snake|sponge|swap|title|upper)) *}/g;

/**
 * Extract the name and types of the variables in the given template.
 *
 * @param {string} template
 */
function getVariables(template) {
    const matches = template.match(VARIABLES_REGEX);

    if (!matches) {
        return [];
    }

    return matches.map((match) => {
        const withoutDelimiter = match.substring(1, match.length - 1).trim();

        // Handle counter variables
        if (withoutDelimiter.endsWith('i')) {
            return {
                type: 'counter',
                width: withoutDelimiter.length,
                match,
            };
        }

        if (withoutDelimiter.indexOf(':') === -1) {
            return {
                type: 'static',
                name: withoutDelimiter,
                match,
            };
        }

        const [name, transform] = withoutDelimiter.split(':');

        const applyTransform = caseTransformers[transform.toLowerCase()];

        return {
            type: 'transformed',
            name,
            match,
            transform,
            applyTransform,
        };
    });
}

/**
 * Escape the given string for use in a RegExp.
 *
 * @param {string} value The string to escape
 */
function escapeRegExp(value) {
    return value.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
}

/**
 * Replace all occurences of the target string with the replacement in the given string.
 *
 * @param {string} string       The string to perform the replacements in
 * @param {string} target       The string to find
 * @param {string} replacement  The replacement string
 */
function replaceAll(string, target, replacement) {
    return string.replace(new RegExp(escapeRegExp(target), 'g'), replacement);
}

/**
 * Compile the given template with the given data.
 *
 * @param {string} template                   The template to compile
 * @param {Array<any>} variables              The array of variables (name and properties)
 * @param {Array<string>} variableValues      The array of variable values, 1-indexed
 * @param {number} counterValue               The current counter value, for expanding counter variables
 * @param {(any) => void} onUnmatchedVariable A function to call when a variable without a matching value is used
 * @return {string}
 */
function compile(
    template,
    variables,
    variableValues,
    counterValue,
    onUnmatchedVariable = () => {}
) {
    let output = template;

    for (const variable of variables) {
        // Expand counters
        if (variable.type === 'counter') {
            output = replaceAll(
                output,
                variable.match,
                String(counterValue).padStart(variable.width, '0')
            );

            continue;
        }

        // Expand static variables
        if (variable.type === 'static') {
            const value = variableValues[Number(variable.name) - 1];

            if (value) {
                output = replaceAll(output, variable.match, value);
            } else {
                onUnmatchedVariable(variable);
            }

            continue;
        }

        // Expand transformed variables
        if (variable.type === 'transformed') {
            const value = variableValues[Number(variable.name) - 1];

            if (value) {
                output = replaceAll(
                    output,
                    variable.match,
                    variable.applyTransform(value)
                );
            } else {
                onUnmatchedVariable(variable);
            }
        }
    }

    return output;
}
