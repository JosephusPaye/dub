const { spongeCase } = require('sponge-case');
const { swapCase } = require('swap-case');
const { titleCase } = require('title-case');
const {
    camelCase,
    capitalCase,
    dotCase,
    headerCase,
    pascalCase,
    sentenceCase,
    snakeCase,
} = require('change-case');

exports.camelCase = camelCase;
exports.capitalCase = capitalCase;
exports.dotCase = dotCase;
exports.headerCase = headerCase;
exports.kebabCase = kebabCase;
exports.lowerCase = lowerCase;
exports.pascalCase = pascalCase;
exports.sentenceCase = sentenceCase;
exports.snakeCase = snakeCase;
exports.spongeCase = spongeCase;
exports.swapCase = swapCase;
exports.titleCase = titleCase;
exports.upperCase = upperCase;

/**
 * Convert the given string to upper case.
 *
 * @param {string} string  The string to convert to upper case
 */
function upperCase(string) {
    return string.toLocaleUpperCase();
}

/**
 * Convert the given string to lower case.
 *
 * @param {string} string The string to convert to lower case
 */
function lowerCase(string) {
    return string.toLocaleLowerCase();
}

/**
 * Convert the given string to kebab case.
 *
 * @param {string} string The string to convert to kebab case
 */
function kebabCase(string) {
    return headerCase(string).toLowerCase();
}
