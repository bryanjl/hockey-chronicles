const Team = require('../models/Team');
const Player = require('../models/Player');

const topFive = (model) => async(req, res, next) => {

    //this pipeline gives top 5 teams with most fights by season
    //on the fight model
    const teamsPipeline = [
        {
            $project: {
                city: 1,
                name: 1,
                numberOfFights: {$cond: { if: {$isArray: "$fights"}, then: {$size: "$fights"}, else: "NA"}}
            }
        },
        {
            $sort: {
                numberOfFights: -1
            }
        },
        {
            $limit: 5
        }
    ];



    const playersPipeline = [
        {
            $project: {
                firstName: 1,
                lastName: 1,
                numberOfFights: {$cond: { if: {$isArray: "$fights"}, then: {$size: "$fights"}, else: "NA"}}
            }
        },
        {
            $sort: {
                numberOfFights: -1
            }
        },
        {
            $limit: 5
        }
    ];


    //check if season was in the query
    if(req.query.season) {
        let season  = {
            '$match': {
                'season.season': req.query.season
            }
        }
        teamsPipeline.unshift(season);
        playersPipeline.unshift(season);
    }

    let teamsResult = await Team.aggregate(teamsPipeline);
    let playersResult = await Player.aggregate(playersPipeline);

    res.topFiveTeams = teamsResult;
    res.topFivePlayers = playersResult;

    next();
}

module.exports = topFive;