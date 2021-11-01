const fs = require('fs');

const {
    connectDB,
    seedPlayer,
    deleteDB
} = require('./seeder');


function textScrape() {
    fs.readFile("hockey.txt", async(err, data) => {
        if (err) throw err;
        await connectDB();
        let hockeyData = Buffer.from(data).toString(); 
        // console.log('finshed');
        hockeyData = hockeyData.split("\t");
        let hockeyNames = [];
        // let regex = /^(0|[1-9][0-9]{0,2}(?:(,[0-9]{3})*|[0-9]*))(\.[0-9]+){0,1}$/;
        let regex = /[0-9]/;
        for(let i =0; i < hockeyData.length; i++){
            if(regex.test(hockeyData[i]) || hockeyData[i] === ' ' || hockeyData[i] === 'totals'){
                continue;
            }else{
                hockeyNames.push(hockeyData[i]);
            }
        }
        let playerNames = [];
        let teamNames = [];

        let namePattern = /\(.*?\)/;
        let positionPattern = /\(([^)]+)\)/;
        for(let i = 0; i < hockeyNames.length; i++){
            if(namePattern.test(hockeyNames[i])){

                let position = positionPattern.exec(hockeyNames[i])[1];
                let player = hockeyNames[i].split(namePattern)[0].trim();
                
                await seedPlayer(player.split(' ')[0], player.split(' ')[1], position);

            } else {
                teamNames.push(hockeyNames[i]);
            } 
        }
        console.log('Players Seeded')

    })
}


// textScrape();
if(process.argv[2] === '-d'){
    connectDB();
    deleteDB();
} else if(process.argv[2] === '-seedPlayer') {
    textScrape();
}