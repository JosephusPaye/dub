const fs = require('fs');
const path = require('path');

function getFilenames(dir) {
    return new Promise((resolve, reject) => {
        fs.readdir(dir, (err, names) => {
            if (err) {
                reject(err);
            }

            const files = names.filter(name => {
                return fs.statSync(path.join(dir, name)).isFile();
            });

            resolve(files);
        });
    });
}

function rename(oldPath, newPath) {
    return new Promise((resolve, reject) => {
        fs.rename(oldPath, newPath, (err) => {
            if (err) {
                reject(err);
            }

            resolve(newPath);
        });
    });
}

function renameAll(paths, directory) {
    const renames = paths.map(p => {
        return rename(path.join(directory, p.from), path.join(directory, p.to)).catch(err => console.err);
    });

    return Promise.all(renames);
}

module.exports = {
    getFilenames,
    rename,
    renameAll
};
