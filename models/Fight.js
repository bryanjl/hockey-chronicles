const mongoose = require('mongoose');

const League = require('../models/League');
const Season = require('../models/Season');
const Team = require('../models/Team');
const Player = require('../models/Player');

const FightSchema = new mongoose.Schema({
    game: {
        type: mongoose.Schema.ObjectId,
        ref: 'Game'
    },
    teams: {
        type: [Object]
    },
    players: {
        type: [Object]
    },
    season: {
        type: Object
    },
    league: {
        type: Object
    },
    date: {
        type: Date,
        required: [true, 'Please add a date']
    },
    comments: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Comment'
    },
    description: {
        type: String,
        default: ''
    },
    eventDescription: {
        type: String,
        default: ''
    },
    outcome: {
        type: Object
    },
    videoLink: {
        type: String,
        default: ''
    },
    gameType: {
        type: String,
        enum: ['Regular', 'Round 1', 'Preseason', 'Quarter Final', 'Semi Final', 'Final'],
        default: 'Regular'
    },
    fightType: {
        type: String,
        enum: ['Rough', 'Cheap', 'Brawl', 'Refused', 'Hit', 'Fight', 'Almost', 'Event'],
        default: 'Fight'
    },
    actionRating: {
        type: Object
    },
    unfair: {
        type: Boolean,
        default: false
    },  
    createdAt: {
        type: Date,
        default: Date.now()
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
    }
});


//saving references of created fights to other collections(season, league, player, etc)
FightSchema.pre('save', async function(next) {
    if(this.isNew){
        //create reference of fight for season
        let season = await Season.findById(this.season.id);
        season.fights.push(this._id);
        await season.save();

        //create reference of fight for league
        let league = await League.findById(this.league.id);
        league.fights.push(this._id);
        await league.save();

        //create reference of fight for players
        this.players.forEach(async(element) => {
            let player = await Player.findById(element.id);
            player.fights.push(this._id);
            await player.save();
        });

        //create reference of fight for teams
        this.teams.forEach(async(element) => {
            let team = await Team.findById(element.id);
            team.fights.push(this._id);
            await team.save();
        });
    }
    next();
});

//update the outcome results based on votes
FightSchema.methods.updateOutcome = async function(reqOutcome) {
    try {
        //if all values in the reqoutcome object are the same -> do nothing
        let reqObjVals = Object.values(reqOutcome);
        if(reqObjVals.every(val => val === reqObjVals[0])){
            this.outcome = reqOutcome;
            return;
        }

        //currOutcomeWinner is the current winner from this.outcome
        let currOutcomeKeys = Object.keys(this.outcome);
        let currOutcomeValue = 0;
        let currOutcomeWinner;
        for(let i = 0; i < currOutcomeKeys.length; i++){
            if(this.outcome[currOutcomeKeys[[i]]] > currOutcomeValue) {
                currOutcomeWinner = currOutcomeKeys[i];
                currOutcomeValue = this.outcome[currOutcomeKeys[[i]]];
            }
        }

        //reqOutcomeWinner is the winner from the request outcome
        let reqOutcomeKeys = Object.keys(reqOutcome);
        let reqOutcomeValue = 0;
        let reqOutcomeWinner;
        for(let i = 0; i < reqOutcomeKeys.length; i++){
            if(reqOutcome[reqOutcomeKeys[i]] > reqOutcomeValue){
                reqOutcomeWinner = reqOutcomeKeys[i];
                reqOutcomeValue = reqOutcome[reqOutcomeKeys[i]];
            }
        }

        //1) same winner as before -> no change
        if(currOutcomeWinner === reqOutcomeWinner){
            this.outcome = reqOutcome;
            return;
        }

        // 2) draw has most votes previous winnner was a player -> 
        //prev winner gets -1 wins and +1 draws
        //prev loser gets -1 losses and +1 draws

        if(reqOutcomeWinner === 'draw' && currOutcomeWinner !== 'draw'){
            //player1 is the previous winner and recieves -1 wins and +1 draw
            
            let player1 = await Player.findById(currOutcomeWinner);
            if(player1.wins > 0){
                player1.wins -= 1;
            }
            player1.draws += 1;
            await player1.save();

            //player2 is the previous loser and recieves -1 losses and +1 draw

            const prevLoser = currOutcomeKeys.filter(key => key != 'draw' && key != currOutcomeWinner);
            let player2 = await Player.findById(prevLoser);
            if(player2.losses > 0) {
                player2.losses -= 1;
            }
            player2.draws += 1;
            await player2.save();

            this.outcome = reqOutcome;
            return;
        }

        // 3)New player winner from old previous player winner ->
        //prev winner gets -1 wins and +1 losses
        //new winner gets +1 wins and -1 losses

        if(reqOutcomeWinner !== 'draw' && currOutcomeWinner !== 'draw'){
            //player1 is the new winner and receives +1 wins and -1 losses

            let player1 = await Player.findById(reqOutcomeWinner);
            if(player1.losses > 0){
                player1.losses -= 1;
            }
            player1.wins += 1;
            await player1.save();

            //player2 is the prev winner and receives -1 wins and +1 losses

            let player2 = await Player.findById(currOutcomeWinner);
            if(player2.wins > 0) {
                player2.wins -= 1;
            }
            player2.losses += 1;
            await player2.save();

            this.outcome = reqOutcome;
            return;
        }

        //4)new player winner previous was a draw ->
        //new winner gets +1 win and -1 draws
        //new loser gets +1 losses and -1 draws

        if(reqOutcomeWinner !== 'draw' && currOutcomeWinner === 'draw'){
            //player1 is the new winner and receives +1 wins and -1 draws

            let player1 = await Player.findById(reqOutcomeWinner);
            if(player1.draws > 1){
                player1.draws -= 1;
            }
            player1.wins += 1;
            await player1.save();

            //player2 is the new loser and recieves +1 losses and -1 draws

            const newLoser = reqOutcomeKeys.filter(key => key != 'draw' && key != reqOutcomeWinner);
            let player2 = await Player.findById(newLoser);
            if(player2.draws > 0){
                player2.draws -= 1;
            }
            player2.losses += 1;
            await player2.save();

            this.outcome = reqOutcome;
            return;
        }
    } catch (error) {
        console.log(error);
    }
}

FightSchema.methods.updateActionRating = async function(newScore) {
    
    let currAverage = this.actionRating.average;
    let votes = this.actionRating.votes;

    currAverage = ((currAverage * votes) + newScore) / (votes + 1);

    this.actionRating.average = currAverage.toFixed(2);
    this.actionRating.votes += 1;

    let player1 = await Player.findById(this.players[0].id);
    let player2 = await Player.findById(this.players[1].id);

    player1.updateActionRating(currAverage);
    player2.updateActionRating(currAverage);

    player1.markModified('actionRating');
    player2.markModified('actionRating');
    await player1.save();
    await player2.save();
    // console.log(player1, player2);
}

FightSchema.methods.updateUnfair = async function(newUnfair){
    // console.log(this.unfair, newUnfair);

    if(this.unfair === newUnfair){
        // console.log('here');
        return;
    }
    
    this.unfair = newUnfair;

    let player1 = await Player.findById(this.players[0].id);
    let player2 = await Player.findById(this.players[1].id);

    if(newUnfair){
        player1.unfairTally += 1;
        player2.unfairTally += 1;
    } else {
        if(player1.unfairTally > 0){
            player1.unfairTally -= 1;
        }
        if(player2.unfairTally > 0){
            player2.unfairTally -= 1;
        }    
    }

    await player1.save();
    await player2.save();
}

//THIS NEEDS CHANGING SINCE EMBEDDING DOCUMENTS INSTEAD OF REFERENCING PLAYERS
FightSchema.methods.updatePlayers = async function(playersToChange){
    //get player that isn't changing
    let playersArr = this.players;
    let index = playersArr.indexOf(playersToChange[0]);
    if(index > -1){
        playersArr.splice(index, 1);
    }
    let otherPlayer = playersArr[0];

    //stats obj to update players/fight
    let stats = {
        wins: 0,
        losses: 0,
        draw: 0
    };

    //unfair tally to change players
    let unfairTally;
    this.unfair ? unfairTally = 1 : unfairTally = 0;
    stats.unfairTally = unfairTally;

    //actionRating
    stats.actionRating = this.actionRating.average;
    stats.votes = this.actionRating.votes;

    //Win loss or draw
    if(this.outcome[this.players[0]] === this.outcome[this.players[1]]){
        stats.draw = 1;
    } else if(this.outcome[playersToChange[0]] > this.outcome[otherPlayer]){
        stats.wins = 1;
    } else {
        stats.losses = 1;
    }

    //outcome
    stats.outcome = this.outcome[playersToChange[[0]]];

    //get Players
    let playerToRemove = await Player.findById(playersToChange[0]);
    let playerToAdd = await Player.findById(playersToChange[1]);

    //update the outcome freq counter
    delete this.outcome[playersToChange[0]];
    this.outcome[playersToChange[1]] = stats.outcome;

    //change players stats
    //wins-loss-draw
    playerToRemove.wins += -stats.wins;
    playerToRemove.losses += -stats.losses;
    playerToRemove.draw += -stats.draw;

    playerToAdd.wins += stats.wins;
    playerToAdd.losses += stats.losses;
    playerToAdd.draw += stats.draw;

    //player's action rating
    //actionrating is alrady averaged no need to adjust votes
    await playerToRemove.updateActionRating(-stats.actionRating);
    await playerToAdd.updateActionRating(stats.actionRating);

    playerToAdd.markModified('actionRating');
    playerToRemove.markModified('actionRating');

    //unfair tally
    playerToRemove.unfairTally += -stats.unfairTally;
    playerToAdd.unfairTally += stats.unfairTally;

    //player's fights array
    playerToAdd.fights.push(this._id);
    let fightIndex = playerToRemove.fights.indexOf(this._id);
    playerToRemove.fights.splice(fightIndex, 1);
    playerToAdd.markModified('fights');
    playerToRemove.markModified('fights');

    //change the fights player array
    this.players = [otherPlayer, playersToChange[1]];
    
    //save players
    await playerToRemove.save();
    await playerToAdd.save();
}

//THIS NEEDS CHANGING SINCE EMBEDDING DOCUMENTS INSTEAD OF REFERENCING TEAMS
FightSchema.methods.updateTeams = async function(newTeams){
    //get teams
    let teamToChange = await Team.findById(newTeams[0]);
    let teamToAdd = await Team.findById(newTeams[1]);

    // console.log(teamToChange, teamToAdd);

    //remove fight from team.fights array
    let fightIndex = teamToChange.fights.indexOf(this._id);
    teamToChange.fights.splice(fightIndex, 1);

    //add fight to team.fights
    teamToAdd.fights.push(this._id);

    //mark modified and save
    teamToAdd.markModified('fights');
    teamToChange.markModified('fights');

    await teamToAdd.save();
    await teamToChange.save();

    //update this.teams
    let teamIndex = this.teams.indexOf(newTeams[0]);
    this.teams[teamIndex] = newTeams[1];
}

//THIS NEEDS CHANGING SINCE EMBEDDING DOCUMENTS INSTEAD OF REFERENCING SEASON
FightSchema.methods.updateSeason = async function(newSeasonId){
    let currSeason = await Season.findById(this.season);

    let fightIndex = currSeason.fights.indexOf(this._id);
    currSeason.fights.splice(fightIndex, 1);
    currSeason.markModified('fights');
    await currSeason.save();

    let newSeason = await Season.findById(newSeasonId);
    newSeason.fights.push(this._id);
    newSeason.markModified('fights');
    await newSeason.save();

    this.season = newSeason._id;
}

//THIS NEEDS CHANGING SINCE EMBEDDING DOCUMENTS INSTEAD OF REFERENCING LEAGUE
FightSchema.methods.updateLeague = async function(newLeagueId){
    let currLeague = await League.findById(this.league);

    let fightIndex = currLeague.fights.indexOf(this._id);
    currLeague.fights.splice(fightIndex, 1);
    currLeague.markModified('fights');
    await currLeague.save();

    let newLeague = await League.findById(newLeagueId);
    newLeague.fights.push(this._id);
    newLeague.markModified('fights');
    await newLeague.save();

    this.league = newLeague._id;
}

module.exports = mongoose.model('Fight', FightSchema);