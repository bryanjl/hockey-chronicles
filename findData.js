const fs = require('fs');

const printData = (data) => {
    for(let i = 2044; i < 2048; i++) {
        console.log(data[i]);
    }
}

const games = JSON.parse(fs.readFileSync(`${__dirname}/_data/compiledNHL7075.json`, 'utf-8'));
printData(games)