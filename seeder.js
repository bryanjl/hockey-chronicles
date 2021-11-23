const mongoose = require('mongoose');
const dotenv = require('dotenv');
const fs = require('fs');


dotenv.config({ path: './config/config.env' });

//models
const Player = require('./models/Player');
const Fight = require('./models/Fight');
const Season = require('./models/Season');
const League = require('./models/League');
const Team = require('./models/Team');

//data
// const fights = JSON.parse(fs.readFileSync(`${__dirname}/_data/fights.json`, 'utf-8'));
// const players = JSON.parse(fs.readFileSync(`${__dirname}/_data/players.json`, 'utf-8'));
// const seasons = JSON.parse(fs.readFileSync(`${__dirname}/_data/seasons.json`, 'utf-8'));
// const leagues = JSON.parse(fs.readFileSync(`${__dirname}/_data/leagues.json`, 'utf-8'));
// const teams = JSON.parse(fs.readFileSync(`${__dirname}/_data/teams.json`, 'utf-8'));

//connect the DB
const connectDB = async() => {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    console.log(`DB Connected ${conn.connection.host}`);    
}

const seedFights = async(fights) => {
    await connectDB();

    try {
        let i = 1;
        for(let fight of fights){
            // console.log(fight.league);
            let fightObj = {};
    
            let league = await League.findOne({ name: fight.league });
            fightObj.league = league;
    
            let season = await Season.findOne({ season: fight.season });
            fightObj.season = season;
    
            let players = await Player.find({
                lastName: {
                    $in: fight.players
                }
            }, '_id');
            fightObj.players = players
    
            let teams = await Team.find({
                name: {
                    $in: fight.teams
                }
            }, '_id');
            fightObj.teams = teams
    
            let outcome = {};
            fightObj.players.forEach(element => {
                outcome[element._id] = 1;
            });
            fightObj.outcome = outcome;
    
            let actionRating = {
                average: 0,
                votes: 0
            };
            fightObj.actionRating = actionRating;
    
            fightObj.date = new Date(fight.date);
    
            await Fight.create(fightObj);
            console.log(`Fight ${i} of ${fights.length} seeded`);
            i++;
        }
        process.exit();
    } catch (error) {
        console.log(error);
    }
}

const seedPlayers = async(players) => {
    await connectDB();

    try {
        let i = 1;
        for(let player of players){
            let actionRating = {
                average: 0,
                votes: 0
            };
            player.actionRating = actionRating;
            
            await Player.create(player);
            console.log(`Player ${i} of ${players.length} seeded`);
            i++;
        }
        process.exit();
    } catch (error) {
        console.log(error);
    }
}

const seedLeagues = async(leagues) => {
    await connectDB();

    try {
        let i = 0;
        for(let league of leagues){
            await League.create(league);
            console.log(`League ${i} of ${leagues.length} seeded`);
            i++;
        }
        process.exit();
    } catch (error) {
        console.log(error)
    }
}

const seedSeasons = async(seasons) => {
    await connectDB();

    try {
        let i = 1;

        for(let season of seasons){
            await Season.create(season);
            console.log(`Season ${i} of ${seasons.length} seeded`);
            i++;
        }
        process.exit();
    } catch (error) {
        console.log(error);
    }
}

const seedTeams = async(teams) => {
    await connectDB();

    try {
        let i = 1;

        for(let team of teams){

            let league = await League.findOne({ name: team.league });

            team.league = league._id;

            await Team.create(team);

            console.log(`Team ${i} of ${teams.length} seeded`);
            i++;
        }
        process.exit();
    } catch (error) {
        console.log(error);
    }
}

if(process.argv[2] === '-seedFights'){
    const fights = JSON.parse(fs.readFileSync(`${__dirname}/_data/fights.json`, 'utf-8'));
    seedFights(fights);
} else if(process.argv[2] === '-seedPlayers'){
    const players = JSON.parse(fs.readFileSync(`${__dirname}/_data/players.json`, 'utf-8'));
    seedPlayers(players);
} else if(process.argv[2] === '-seedLeagues'){
    const leagues = JSON.parse(fs.readFileSync(`${__dirname}/_data/leagues.json`, 'utf-8'));
    seedLeagues(leagues);
} else if(process.argv[2] === '-seedSeasons'){
    const seasons = JSON.parse(fs.readFileSync(`${__dirname}/_data/seasons.json`, 'utf-8'));
    seedSeasons(seasons);
} else if(process.argv[2] === '-seedTeams'){
    const teams = JSON.parse(fs.readFileSync(`${__dirname}/_data/teams.json`, 'utf-8'));
    seedTeams(teams);
}



