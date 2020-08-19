const { test } = require('uvu');
const assert = require('uvu/assert');

const { getVariables, compile } = require('../template');
const changeCase = require('../change-case');

test('getVariables() ignores invalid variables', () => {
    // Delimiters
    assert.equal(
        getVariables('{i'),
        [],
        'Unmatched opening delimiters are invalid'
    );
    assert.equal(
        getVariables('i}'),
        [],
        'Unmatched closing delimiters are invalid'
    );

    // Counters
    assert.equal(
        getVariables('{nahi}'),
        [],
        'Non-digits before `i` in counter are invalid'
    );
    assert.equal(
        getVariables('{1i}'),
        [],
        'Non-zero digit before `i` in counter are invalid'
    );
    assert.equal(
        getVariables('{inah}'),
        [],
        'Something after `i` in counter is invalid'
    );

    // Static variables
    assert.equal(
        getVariables('{0.1}-{n1}-{1n}'),
        [],
        'Non-digit variables are invalid'
    );
    assert.equal(
        getVariables('{-1}'),
        [],
        'Negative digit variables are invalid'
    );

    // Transformed variables
    assert.equal(
        getVariables('{:}-{:u}-{1:}'),
        [],
        'Incomplete transforms are invalid'
    );
    assert.equal(
        getVariables('{1:nah}-{1:_}'),
        [],
        'Unknown transforms are invalid'
    );
    assert.equal(
        getVariables('{1:ul}-{1:st}'),
        [],
        'Multiple transforms are invalid'
    );
});

test('getVariables() extracts counter variables', () => {
    const variables = getVariables('{i}-{0i}-{00i}');

    assert.is(3, variables.length, 'Matched three variables');

    assert.equal(
        variables[0],
        {
            type: 'counter',
            width: 1,
            match: '{i}',
        },
        'Counter with no padding'
    );

    assert.equal(
        variables[1],
        {
            type: 'counter',
            width: 2,
            match: '{0i}',
        },
        'Counter padded to two digits'
    );

    assert.equal(
        variables[2],
        {
            type: 'counter',
            width: 3,
            match: '{00i}',
        },
        'Counter padded to three digits'
    );
});

test('getVariables() extracts static variables', () => {
    const variables = getVariables('{1}-{2}-{999}');

    assert.is(3, variables.length, 'Matched three variables');

    assert.equal(variables[0], {
        type: 'static',
        name: '1',
        match: '{1}',
    });

    assert.equal(variables[1], {
        type: 'static',
        name: '2',
        match: '{2}',
    });

    assert.equal(variables[2], {
        type: 'static',
        name: '999',
        match: '{999}',
    });
});

test('getVariables() extracts transformed variables', () => {
    let template = '';

    let i = 1;
    for (const key of Object.keys(changeCase)) {
        const transform = key.replace('Case', '');
        template += `{${i}:${transform}}`;
        i++;
    }

    const variables = getVariables(template);

    assert.is(
        Object.keys(changeCase).length,
        variables.length,
        'Got the expected number of variables'
    );

    let j = 0;
    for (const key of Object.keys(changeCase)) {
        const transform = key.replace('Case', '');
        assert.equal(
            variables[j],
            {
                type: 'transformed',
                name: `${j + 1}`,
                match: `{${j + 1}:${transform}}`,
                transform,
                applyTransform: changeCase[key],
            },
            `correctly parses ${transform} case transform`
        );
        j++;
    }
});

test('compile() calls onUnmatchedVariable() when an variable without a matching value is used', () => {
    const variables = [
        { type: 'static', name: '1', match: '{1}' },
        { type: 'static', name: '2', match: '{2}' },
        {
            type: 'transformed',
            name: '3',
            match: '{3:upper}',
            transform: 'upper',
            applyTransform: changeCase.upperCase,
        },
    ];

    const variableValues = [
        'one', // the value of variable '1',
        undefined, // no matching value for variable '2',
        undefined, // no matching value for variable '3'
    ];

    let onUnmatchedVariableCalls = 0;

    const compiled = compile(
        '{1}{2}{3}',
        variables,
        variableValues,
        0,
        (variable) => {
            assert.ok(
                variable.name === '2' || variable.name === '3',
                "the unmatched variable was '2' or '3'"
            );
            onUnmatchedVariableCalls += 1;
        }
    );

    assert.equal(compiled, 'one{2}{3}');
    assert.is(
        2,
        onUnmatchedVariableCalls,
        'onUnmatchedVariable() was called twice'
    );
});

test('compile() expands counter variables', () => {
    let variables, variableValues, counterValue, compiled;

    // Unpadded counter
    variables = [{ type: 'counter', match: '{i}', width: 1 }];
    variableValues = [];
    counterValue = 1;

    compiled = compile('{i}-{i}', variables, variableValues, counterValue);
    assert.equal(compiled, '1-1');

    // Padded counter
    variables = [{ type: 'counter', match: '{00i}', width: 3 }];
    variableValues = [];
    counterValue = 2;

    compiled = compile('{00i}-{00i}', variables, variableValues, counterValue);
    assert.equal(compiled, '002-002');
});

test('compile() expands static variables', () => {
    const variables = [
        { type: 'static', name: '1', match: '{1}' },
        { type: 'static', name: '2', match: '{2}' },
    ];

    const variableValues = ['one', 'two'];

    const compiled = compile('{1}-{2}-{1}', variables, variableValues, 0);

    assert.equal(compiled, 'one-two-one');
});

test('compile() expands transformed variables', () => {
    const transformed = {
        camel: 'brienneOfTarth',
        capital: 'Brienne Of Tarth',
        dot: 'brienne.of.tarth',
        header: 'Brienne-Of-Tarth',
        kebab: 'brienne-of-tarth',
        lower: 'brienne of tarth',
        pascal: 'BrienneOfTarth',
        sentence: 'Brienne of tarth',
        snake: 'brienne_of_tarth',
        swap: 'bRIENNE oF tARTH',
        title: 'Brienne Of Tarth',
        upper: 'BRIENNE OF TARTH',
    };

    const variableValues = ['Brienne Of Tarth'];

    for (const key of Object.keys(changeCase)) {
        const transform = key.replace('Case', '');

        const compiled = compile(
            `{1:${transform}}`,
            [
                {
                    type: 'transformed',
                    name: '1',
                    match: `{1:${transform}}`,
                    transform,
                    applyTransform: changeCase[key],
                },
            ],
            variableValues,
            0
        );

        if (transform !== 'sponge') {
            assert.equal(
                compiled,
                transformed[transform],
                'correctly transforms ' + transform + ' case'
            );
        } else {
            assert.not.equal(
                compiled,
                variableValues[0],
                'randomizes casing with sponge case'
            );
        }
    }
});

test.run();
