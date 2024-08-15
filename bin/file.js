const fs = require('fs/promises');

async function writeFile(setting, filename) {
    await fs.writeFile(filename, JSON.stringify(setting, undefined, 2));
    console.log(`wrote to file ${filename}`);
}

async function readFile(filename) {
    const data = await fs.readFile(filename);
    return data;
}

module.exports = {
    writeFile: writeFile,
    readFile: readFile
}