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
const Game = require('./models/Game');

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

const seedGames = async(gameData) => {
    await connectDB();

    const createGame = async(data) => {
        try {
            let gameInfo = {};

            gameInfo.date = new Date(data.date);

            //set teams
            let teams = [];
            let team1 = await Team.findOne({ city: data.teams[0] });
            let team1Info = {
                id: team1._id,
                city: team1.city,
                name: team1.name
            }
            teams.push(team1Info);

            let team2 = await Team.findOne({ city: data.teams[1] });
            let team2Info = {
                id: team2._id,
                city: team2.city,
                name: team2.name
            }
            teams.push(team2Info);

            gameInfo.teams = teams

            //set league
            let leagueInfo = await League.findOne({ name: data.league });

            let league = {
                id: leagueInfo._id,
                name: leagueInfo.name
            }

            gameInfo.league = league;

            //set season
            let seasonInfo = await Season.findOne({ season: data.season });

            let season = {
                id: seasonInfo._id,
                season: seasonInfo.season
            }

            gameInfo.season = season;

            //set gameType
            if(data.gameType){
                gameInfo.gameType = data.gameType 
            }
            
            let game = await Game.create(gameInfo);

            return game;

        } catch (error) {
            console.log(error);
            //if error creating game return error and continue
            return 'error';
        }
    }

    const createFight = async(data) => {
        try {
            //if there are no players in the request skip creating the fight
            let fightInfo = {};

            if(data.players.length === 3) {
                fightInfo.fightType = data.players.pop();
            }
            // console.log(fightInfo, data.players);

            if(data.players.length === 1) {
                fightInfo.fightType = 'Event';
                fightInfo.description = data.players[0];
            }

            //get objectID to save for relations 
            let leagueId = await League.findOne({  name: data.league.toUpperCase() });
            
            fightInfo.league = {
                id: leagueId._id,
                league: leagueId.name
            }
            

            let seasonId = await Season.findOne({  season: data.season });
            
            fightInfo.season = {
                id: seasonId._id,
                season: seasonId.season
            }
            
            //if this an event we don't need players
            if(data.players.length > 1){
                 //!!!Test for different number of players/wrong spelling etc
                //!!How to handle unknow players/fighters???
                let playersId = [];
                for(let k = 0; k < data.players.length; k++){
                    let playerInfo = await Player.findOne({
                        lastName: {
                            $in: data.players[k]
                        }
                    }, '_id');
                    playersId.push(playerInfo);
                }
                
                

                // console.log(playersId);
                
                let players = [];

                // if the player is unknown

                // console.log('made it here', playersId)
                
                let player1 = await Player.findById(playersId[0]._id);
                let player1Info = {
                    id: player1._id,
                    firstName: player1.firstName,
                    lastName: player1.lastName,
                    position: player1.position,
                    wins: player1.wins,
                    losses: player1.losses,
                    draws: player1.draws,
                    height: player1.height,
                    weight: player1.weight,
                    shoots: player1.shoots
                }
                players.push(player1Info);
            
            
            

                let player2 = await Player.findById(playersId[1]._id);
                let player2Info = {
                    id: player2._id,
                    firstName: player2.firstName,
                    lastName: player2.lastName,
                    position: player2.position,
                    wins: player2.wins,
                    losses: player2.losses,
                    draws: player2.draws,
                    height: player2.height,
                    weight: player2.weight,
                    shoots: player2.shoots
                }
                players.push(player2Info);
                

                // console.log(players)

                fightInfo.players = players;
            }

           
            
            

            let teamsId = await Team.find({
                city: {
                    $in: data.teams
                }
            }, '_id');

            // console.log(teams);

            
            //embed teams to fight document
            let teams = [];
            let team1 = await Team.findById(teamsId[0]._id);
            let  team1Info = {
                id: team1._id,
                name: team1.name,
                city: team1.city
            }
            teams.push(team1Info);
            let team2 = await Team.findById(teamsId[1]._id);
            let team2Info = {
                id: team2._id,
                name: team2.name,
                city: team2.city
            }
            teams.push(team2Info);

            // console.log(teams)

            fightInfo.teams = teams;
            

            // if this is an event don't need outcome
            if (data.players.length > 1) {
                //outcome frequency counter for voting
                let outcome = {};
                fightInfo.players.forEach(element => {
                    outcome[element.id] = 1;
                });
                outcome.draw = 1;
                //set outcome object to request body
                fightInfo.outcome = outcome;
            }

            

            //action rating average - freq counter
            let actionRating = {
                average: 0,
                votes: 0
            };
            //set actionRating to request body
            fightInfo.actionRating = actionRating;    

            //Date of fight
            fightInfo.date = new Date(data.date);

            // create fight
            let fight = await Fight.create(fightInfo);

            return fight;

        } catch (error) {
            console.log(error);
            return 'error';
        }
    }

    for(let i = 0; i < gameData.length; i++){
        console.log(`game ${i+1} of ${gameData.length} seeded`)
        //if players array is empty then create game with no fights
        if(gameData[i].players.length === 0){
            let game = await createGame(gameData[i]);

            if(game === 'error'){
                console.log(`ERROR at ${gameData[i]}`);
                continue;
            }
        }
        
        //if players array is an array of arrays then there is multiple fights to create
        else if(Array.isArray(gameData[i].players[0])){
            //create an array for returned fights
            let createdFights = [];

            //loop through array and create fight for each sub array
            for(let j = 0; j < gameData[i].players.length; j++) {
                let fightData = {...gameData[i]};
                fightData.players = gameData[i].players[j];
                let returnedFight = await createFight(fightData);
                if (returnedFight === 'error') {
                    console.log(`ERROR at ${fightData}`);
                    continue;
                }
                createdFights.push(returnedFight._id);
            }
            //keep fight._id to add to array for game
            
            let game = await createGame(gameData[i]);
            if(game === 'error'){
                console.log(`ERROR at ${gameData[i]}`);
                continue;
            }
            // console.log(game);
            // console.log(createdFights);
            game.fights = createdFights;
            game.markModified('fights');
            await game.save();
            
            //must go back and add game._id to each fight after game is created
            for(let j = 0; j < createdFights.length; j++){
                let fight = await Fight.findById(createdFights[j]);
                fight.game = game._id;
                fight.markModified('game');
                await fight.save();
            }    
        }

        else if(!Array.isArray(gameData[i].players[0])){
            let createdFight = [];
            
            let fight = await createFight(gameData[i]);
            createdFight.push(fight._id);

            let game = await createGame(gameData[i]);

            fight.game = game._id;
            fight.markModified('game');
            await fight.save();

            game.fights = createdFight;
            game.markModified('fights');
            await game.save();
        }
    }
    process.exit();

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

            team.league = {
                id: league._id,
                name: league.name
            }

            await Team.create(team);

            console.log(`Team ${i} of ${teams.length} seeded`);
            i++;
        }
        process.exit();
    } catch (error) {
        console.log(error);
    }
}

const deleteTeams = async() => {
    await connectDB();
    try {
        await Team.deleteMany();
        console.log('teams deleted');
        process.exit();
    } catch (error) {
        console.log(error)
    }
}

const deletePlayers = async() => {
    await connectDB();

    try {
        await Player.deleteMany();

        console.log('Players deleted');
        process.exit();
    } catch (error) {
        console.log(error);
    }    
}

if(process.argv[2] === '-seedFights'){
    const fights = JSON.parse(fs.readFileSync(`${__dirname}/_data/fights.json`, 'utf-8'));
    seedFights(fights);
} else if(process.argv[2] === '-seedPlayers'){
    const players = JSON.parse(fs.readFileSync(`${__dirname}/_data/NHL.json`, 'utf-8'));
    seedPlayers(players);
} else if(process.argv[2] === '-seedLeagues'){
    const leagues = JSON.parse(fs.readFileSync(`${__dirname}/_data/leagues.json`, 'utf-8'));
    seedLeagues(leagues);
} else if(process.argv[2] === '-seedSeasons'){
    const seasons = JSON.parse(fs.readFileSync(`${__dirname}/_data/seasons.json`, 'utf-8'));
    seedSeasons(seasons);
} else if(process.argv[2] === '-seedTeams'){
    const teams = JSON.parse(fs.readFileSync(`${__dirname}/_data/NHLteams.json`, 'utf-8'));
    seedTeams(teams);
} else if(process.argv[2] === '-deleteTeams'){
    deleteTeams();
} else if(process.argv[2] === '-deletePlayers'){
    deletePlayers();
} else if(process.argv[2] === '-seedGames'){
    const games = JSON.parse(fs.readFileSync(`${__dirname}/_data/nhl_60-61.json`, 'utf-8'));
    seedGames(games);
}