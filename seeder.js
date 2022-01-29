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
const Comment = require('./models/Comment');

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

    const getInfo = async(data) => {
        let info = {};

        //set date
        info.date = new Date(data.date);

        
        
        //set teams
        let teams = [];
        let team1 = await Team.findOne({ city: data.teams[0] });
        let team1Info = {
            id: team1._id,
            city: team1.city,
            name: team1.name,
            visitor: true
        }
        teams.push(team1Info);

        let team2 = await Team.findOne({ city: data.teams[1] });
        let team2Info = {
            id: team2._id,
            city: team2.city,
            name: team2.name,
            visitor: false
        }
        teams.push(team2Info);

        info.teams = teams;


        //league info
        //get objectID to save for relations 
        let leagueId = await League.findOne({  name: data.league.toUpperCase() });
        
        info.league = {
            id: leagueId._id,
            league: leagueId.name
        }


        //Season Info
        //set season
        let seasonInfo = await Season.findOne({ season: data.season });

        info.season = {
            id: seasonInfo._id,
            season: seasonInfo.season
        }

        // console.log(info)

        info.team1 = team1;
        info.team2 = team2;
        info.seasonInfo = seasonInfo;

        // console.log(info);

        return info;
    }

    const createGame = async(data, gameInfo) => {
        try {
            //set gameType
            if(data.gameType){
                gameInfo.gameType = data.gameType 
            }
            
            let game = await Game.create(gameInfo);

            if(game) {
                gameInfo.team1.games.push(game._id);
                gameInfo.team2.games.push(game._id);
                gameInfo.seasonInfo.games.push(game._id);
                

                gameInfo.team1.markModified('games');
                gameInfo.team2.markModified('games');
                gameInfo.seasonInfo.markModified('games');

                await gameInfo.team1.save();
                await gameInfo.team2.save();
                await gameInfo.seasonInfo.save();
            }

            return game;

        } catch (error) {
            console.log(error);
            //if error creating game return error and continue
            return 'error';
        }
    }

    const createFight = async(data, fightInfo) => {
        try {

            if(data.players.length === 3) {
                fightInfo.fightType = data.players.pop();
            }

            if(data.players.length === 1) {
                fightInfo.fightType = 'Event';
                fightInfo.eventDescription = data.players[0];
            }


            //if this an event we don't need players
            if(data.players.length > 1){
                
                let players = [];

                // if the player is unknown

                // console.log('made it here', playersId)
                
                let player1 = await Player.findOne({ lastName: data.players[0] })

                // let player1 = await Player.findById(playersId[0]._id);
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
            
            
            
                let player2 = await Player.findOne({ lastName: data.players[1] })
                // let player2 = await Player.findById(playersId[1]._id);
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

                fightInfo.players = players;
            }


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
            // fightInfo.date = new Date(data.date);

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
        // console.log(await getInfo(gameData[i]));
        let info = await getInfo(gameData[i]);
        //if players array is empty then create game with no fights
        if(gameData[i].players.length === 1 && gameData[i].players[0] === ""){
            // console.log('here');
            let game = await createGame(gameData[i], info);

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
                let returnedFight = await createFight(fightData, info);
                if (returnedFight === 'error') {
                    console.log(`ERROR at ${fightData}`);
                    continue;
                }
                createdFights.push(returnedFight._id);
            }
            //keep fight._id to add to array for game

            let game = await createGame(gameData[i], info);
            // console.log(game);
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
            
            let fight = await createFight(gameData[i], info);
            createdFight.push(fight._id);

            let game = await createGame(gameData[i], info);

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

            if(player.shoots !== 'L' || player.shoots !== 'R'){
                player.shoots = '';
            }
            
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

const deleteGames = async() => {
    await connectDB();

    try {
        await Game.deleteMany();

        console.log('Games deleted');
        process.exit();
    } catch (error) {
        console.log(error);
    }    
}

const deleteFights = async() => {
    await connectDB();

    try {
        await Fight.deleteMany();

        console.log('Fights deleted');
        process.exit();
    } catch (error) {
        console.log(error);
    }    
}

const deleteComments = async() => {
    await connectDB();

    try {
        await Comment.deleteMany();

        console.log('Comments deleted');
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
} else if(process.argv[2] === '-deleteGames'){
    deleteGames();
} else if(process.argv[2] === '-deleteFights') {
    deleteFights();
} else if(process.argv[2] === '-deleteComments') {
    deleteComments();
}