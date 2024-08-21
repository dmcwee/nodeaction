const fs = require('fs/promises');

async function writeFile(setting, filename) {
    await fs.writeFile(filename, JSON.stringify(setting, undefined, 2));
    console.log(`wrote to file ${filename}`);
}

async function readFile(filename) {
    const data = await fs.readFile(filename);
    return data;
}

async function isFolder(path) {
    const stat = await fs.stat(filename);
    return stat.isDirectory();
}

async function test(path) {
    try {
        const files = await fs.readdir(path);
        for(let file of files){
            console.log(`Opening file ${path}/${file}`);
            const fileContent = await fs.readFile(`${path}/${file}`);
            console.log(`File Content: ${fileContent}`);
        }
    }
    catch (error) {
        console.error(error);
    }
}

module.exports = {
    writeFile,
    readFile,
    isFolder,
    test
}