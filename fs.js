const fs = require('fs');
const path = require('path');
const { promisify } = require('util');

const readdir = promisify(fs.readdir);
const rename = promisify(fs.rename);

exports.getChildNames = getChildNames;
exports.renameAll = renameAll;

/**
 * List the files and directories that are a child of the given parent directory.
 *
 * @param {string} parentDirectory  The parent directory
 * @param {string} childType        The type of child nodes to list, one of "all", "files", and "directories"
 */
async function getChildNames(parentDirectory, childType = 'all') {
    if (!['all', 'files', 'directories'].includes(childType)) {
        throw new Error('Invalid child type: ' + childType);
    }

    const names = await readdir(parentDirectory);

    const matchingNames = names.filter((name) => {
        if (childType === 'all') {
            return true;
        }

        if (childType === 'files') {
            return fs.statSync(path.join(parentDirectory, name)).isFile();
        }

        if (childType === 'directories') {
            return fs.statSync(path.join(parentDirectory, name)).isDirectory();
        }

        return false;
    });

    return matchingNames;
}

/**
 * Perform the given renames, relative to the given parent directory.
 *
 * @param {Array<any>} names
 * @param {string} parentDirectory
 * @param {(err: Error) => void} onError
 */
function renameAll(names, parentDirectory, onError = () => {}) {
    const renames = names.map((name) => {
        return rename(
            path.join(parentDirectory, name.from),
            path.join(parentDirectory, name.to)
        ).catch((err) => {
            onError(err, name, parentDirectory);
        });
    });

    return Promise.all(renames);
}
