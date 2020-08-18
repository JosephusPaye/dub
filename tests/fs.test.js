const fs = require('fs');
const path = require('path');
const assert = require('uvu/assert');
const { test } = require('uvu');
const { promisify } = require('util');

const copyDir = promisify(require('copy-dir'));
const removeDir = promisify(fs.rmdir);
const { getChildNames, renameAll } = require('../fs');

async function assertThrowsAsync(asyncFn, expectedError, message) {
    try {
        await asyncFn();
        assert.unreachable(message);
    } catch (err) {
        assert.ok(
            expectedError ? err.message.includes(expectedError) : true,
            'Expected function not to throw matching exception: ' +
                expectedError
        );
    }
}

async function withSetupAndCleanUp(setUp, cleanUp, fn) {
    await setUp();

    try {
        await fn();
    } catch (err) {
        await cleanUp();
        throw err;
    }

    await cleanUp();
}

function randomName() {
    return 'temp-' + (Math.random() * 100000).toString().slice(0, 5);
}

test('getChildNames() throws invalid child type', async () => {
    await assertThrowsAsync(async () => {
        await getChildNames(process.cwd(), 'nah');
    }, 'Invalid child type: nah');
});

test('getChildNames() gets all files and directores with type `all`', async () => {
    const names = await getChildNames(path.join(__dirname, 'samples'), 'all');
    assert.equal(names, ['directory-a', 'directory-b', 'file-a', 'file-b']);
});

test('getChildNames() gets all files with type `files`', async () => {
    const names = await getChildNames(path.join(__dirname, 'samples'), 'files');
    assert.equal(names, ['file-a', 'file-b']);
});

test('getChildNames() gets all directories with type `directories`', async () => {
    const names = await getChildNames(
        path.join(__dirname, 'samples'),
        'directories'
    );
    assert.equal(names, ['directory-a', 'directory-b']);
});

test('renameAll() performs all given renames', async () => {
    const tempFilesPath = path.join(__dirname, randomName());

    async function setUp() {
        await copyDir(path.join(__dirname, 'samples'), tempFilesPath);
    }

    async function cleanUp() {
        await removeDir(tempFilesPath, { recursive: true });
    }

    await withSetupAndCleanUp(setUp, cleanUp, async () => {
        await renameAll(
            [
                { from: 'directory-a', to: 'directory-a2' },
                { from: 'file-a', to: 'file-a2' },
            ],
            tempFilesPath
        );

        const names = await getChildNames(tempFilesPath);

        assert.not.ok(names.includes('directory-a'));
        assert.ok(names.includes('directory-a2'));

        assert.not.ok(names.includes('file-a'));
        assert.ok(names.includes('file-a2'));
    });
});

test("renameAll() calls onError() callback when there's an error", async () => {
    const tempFilesPath = path.join(__dirname, randomName());

    async function setUp() {
        await copyDir(path.join(__dirname, 'samples'), tempFilesPath);
    }

    async function cleanUp() {
        await removeDir(tempFilesPath, { recursive: true });
    }

    await withSetupAndCleanUp(setUp, cleanUp, async () => {
        let onErrorCalled = false;

        await renameAll(
            [
                { from: 'directory-a', to: 'directory-a2' },
                { from: 'not-a-file', to: 'not-a-file-2' },
            ],
            tempFilesPath,
            (err) => {
                assert.instance(err, Error);
                onErrorCalled = true;
            }
        );

        assert.ok(onErrorCalled);
    });
});

test.run();
