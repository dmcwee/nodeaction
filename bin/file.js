const fs = require('fs');

function writeFile(setting, filename) {
    fs.writeFile(filename, JSON.stringify(setting, undefined, 2), err => {
        if(err) {
            console.log(`!!!!ERROR!!! ${err}`);
        }
        else {
            console.log(`wrote to file ${filename}`);
        }
    })
}

module.exports = {
    writeFile: writeFile
}