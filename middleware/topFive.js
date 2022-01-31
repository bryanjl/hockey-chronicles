const topFive = (model) => async(req, res, next) => {

    //this pipeline gives top 5 teams with most fights by season
    //on the fight model
    const teamsPipeline = [
        {
            '$unwind': {
                'path': '$teams'
            }
        }, {
            '$group': {
                '_id': {
                    'id': '$teams.id', 
                    'city': '$teams.city', 
                    'name': '$teams.name'                    
                }, 
                'count': {
                    '$sum': 1
                }
            }
        }, {
            '$sort': {
                'count': -1
            }
        }, {
            '$limit': 5
        }
    ];



    const playersPipeline = [
        {
            '$unwind': {
                'path': '$players'
            }
        }, {
            '$group': {
                '_id': {
                    'id': '$players.id', 
                    'firstName': '$players.firstName', 
                    'lastName': '$players.lastName'                    
                }, 
                'count': {
                    '$sum': 1
                }
            }
        }, {
            '$sort': {
                'count': -1
            }
        }, {
            '$limit': 5
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

    let teamsResult = await model.aggregate(teamsPipeline);
    let playersResult = await model.aggregate(playersPipeline);

    res.topFiveTeams = teamsResult;
    res.topFivePlayers = playersResult;

    next();
}

module.exports = topFive;