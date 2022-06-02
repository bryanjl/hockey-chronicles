const mongoose = require('mongoose');

const PlayerSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "Please add player's first name"]
    },
    lastName: {
        type: String,
        required: [true, "Please add player's last name"]
    },
    nickname: {
        type: String
    },
    position: {
        type: String,
        default: 'N/A'
    },
    fights: {
        type: [mongoose.Schema.ObjectId],
        ref: 'Fight'
    },
    // {
    //     season(1960-1961): {
    //         team: [{
    //                 id: ObjectId
    //                 name: team fullname
    //                 fights: [fights]
    //          }], -> can have multiple teams to a season
    // 
    //     },
    teams: {
        type: Object
    },
    wins: {
        type: Number,
        default: 0
    },
    losses: {
        type: Number,
        default: 0
    },
    draws: {
        type: Number,
        default: 0
    },
    unfairTally: {
        type: Number,
        default: 0
    },
    actionRating: {
        type: Object
    },
    height: {
        type: String
    },
    weight: {
        type: String 
    },
    shoots: {
        type: String
    },
    yearsActive: {
        type: [String]
    },
    playerImageFile: {
        type: String
    }
});

PlayerSchema.methods.updateActionRating = async function(newScore){
    
    let currAverage = this.actionRating.average;
    let votes = this.actionRating.votes;

    currAverage = ((currAverage * votes) + newScore) / (votes + 1);

    this.actionRating.average = currAverage.toFixed(2);
    this.actionRating.votes += 1;
}

PlayerSchema.methods.updateTeamsPlayedFor = async function(playerInfo, fightInfo) {
    // {
    //     season(1960-1961): {
    //         teamId: {
    //                 name: team fullname
    //                 fights: [fights]
    //          }, -> can have multiple teams to a season
    // 
    //     },
    // console.log('NEW!!!!!!!!!!!!!!!!!!!!')
    // console.log(playerInfo, fightInfo)

    let currTeamsObj = this.teams || {};
    let teamName;
    if(fightInfo.teams.length === 1){
        teamName = `${fightInfo.teams[0].city} ${fightInfo.teams[0].name}`
    } else {
        teamName = fightInfo.teams[0].id === playerInfo.teamId ? `${fightInfo.teams[0].city} ${fightInfo.teams[0].name}`: `${fightInfo.teams[1].city} ${fightInfo.teams[1].name}`;
    }

    if(!currTeamsObj[`${fightInfo.season.season}`]){
        currTeamsObj[`${fightInfo.season.season}`] = {}
        currTeamsObj[`${fightInfo.season.season}`][`${playerInfo.teamId}`] =
            {
                name: teamName,
                fights: [fightInfo._id]
            }
    } else if(currTeamsObj[`${fightInfo.season.season}`] && !currTeamsObj[`${fightInfo.season.season}`][`${playerInfo.teamId}`]) {
        currTeamsObj[`${fightInfo.season.season}`][`${playerInfo.teamId}`] = 
            {
                name: teamName,
                fights: [fightInfo._id]
            }
    } else if(currTeamsObj[`${fightInfo.season.season}`] && currTeamsObj[`${fightInfo.season.season}`][`${playerInfo.teamId}`]){
        let fightExists = false;
        currTeamsObj[`${fightInfo.season.season}`][`${playerInfo.teamId}`].fights.forEach(fight => {
            if(fight.toString() === fightInfo._id.toString()){
                console.log(fight.toString(), fightInfo._id.toString())
                fightExists = true;
            }
        })
        if(fightExists){
            console.log('here', fightExists)
            return;
        }
        currTeamsObj[`${fightInfo.season.season}`][`${playerInfo.teamId}`].fights.push(fightInfo._id);
    }
    this.teams = currTeamsObj;
    // console.log(currTeamsObj.fights)
}

module.exports = mongoose.model('Player', PlayerSchema);