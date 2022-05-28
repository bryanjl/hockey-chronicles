//middleware and utils
const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/ErrorResponse');

//Models
const Fight = require('../models/Fight');
const Player = require('../models/Player');
const Team = require('../models/Team');
const Season = require('../models/Season');

//@desc     Get all Stats for games
//@route    GET /api/v1/stats/games
//@access   Public
exports.getAllGameStats = asyncHandler(async (req, res, next) => {
    //Get all stats for by season and league

    let season = req.query.season;
    let league = req.query.league;

    let playersTop = await topPlayers(season, league);
    let teamsTop = await topTeams(season, league);
    let fightCount = await getTotalFights(season, league);
    let actionHighest = await highestAction(season, league);
    let mostRecent = await recentlyAdded(season, league);

    let data = {
        topPlayers: playersTop,
        topTeams: teamsTop,
        fightCount,
        highestAction: actionHighest,
        mostRecent
    }


    res.status(200).json({
        success: true,
        data
    })
    
});

//get total fights based on season and league
//respond with finals/preseason/regular/total fights
const getTotalFights = async(season = '*', league = '*') => {
    //set for season wildcard or season query
    let seasonSearchAgg;
    if(season === '*'){
        seasonSearchAgg = {
            'wildcard': {
                'query': '*',
                'path': 'season.season',
                allowAnalyzedField: true
            }
        }
    }  else {
        seasonSearchAgg = {
            'phrase': {
                'query': season,
                'path': 'season.season'
            }
        }
    }

    let leagueSearchAgg;
    if(league === '*'){
        leagueSearchAgg = {
            'wildcard': {
                'query': '*',
                'path': 'league.name',
                allowAnalyzedField: true
            }
        }
    }  else {
        leagueSearchAgg = {
            'phrase': {
                'query': league,
                'path': 'league.name'
            }
        }
    }

    let finalsQuery = [
        {
          '$search': {
            'index': 'fights',
            'compound': {
                'must': [
                    {
                        'phrase': {
                            'query': ['Finals', 'Playoff'],
                            'path': 'gameType'
                        },
                    },
                    seasonSearchAgg,
                    leagueSearchAgg
                ]
            }
          }
        },
        {
            '$count': 'finalsCount'
        }        
    ]

    let preseasonQuery = [
        {
          '$search': {
            'index': 'fights',
            'compound': {
                'must': [
                    {
                        'phrase': {
                            'query': ['Preseason'],
                            'path': 'gameType'
                        }
                    },
                    seasonSearchAgg,
                    leagueSearchAgg
                ]
            }
          }
        },
        {
            '$count': 'preseasonCount'
        }        
    ]

    let regularQuery = [
        {
          '$search': {
            'index': 'fights',
            'compound': {
                'must': [
                    {
                        'phrase': {
                            'query': ['Regular'],
                            'path': 'gameType'
                        },
                    },
                    seasonSearchAgg,
                    leagueSearchAgg
                ]
            }
          }
        },
        {
            '$count': 'regularCount'
        }        
    ]

    let totalQuery = [
        {
          '$search': {
            'index': 'fights',
            'compound': {
                'must': [
                    seasonSearchAgg,
                    leagueSearchAgg
                ]
            }
          }
        },
        {
            '$count': 'totalCount'
        }        
    ]
    

    let fightCount = {};
    
    let finalsCount = await Fight.aggregate(finalsQuery);
    let preseasonCount = await Fight.aggregate(preseasonQuery);
    let regularCount = await Fight.aggregate(regularQuery);
    let allFights = await Fight.aggregate(totalQuery);
    //!!!!check to see the counts exist
    fightCount = {
        finalsCount: `${finalsCount[0] ? finalsCount[0].finalsCount : 0}`,
        preseasonCount: `${preseasonCount[0] ? preseasonCount[0].preseasonCount : 0}`,
        regularCount: `${regularCount[0] ? regularCount[0].regularCount : 0}`,
        totalCount: `${allFights[0] ? allFights[0].totalCount : 0}`
    }

    
    return fightCount;
}

//get the top teams by season
const topTeams = async(season = null, league = null) => {
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

    //check if league is in query
    if(league !== null){
        let leaguePipe = {
            '$match': {
                'league.name': league
            }
        }
        teamsPipeline.unshift(leaguePipe);
    }

    //check if season was in the query
    if(season !== null) {
        let seasonPipe  = {
            '$match': {
                'season.season': season
            }
        }
        teamsPipeline.unshift(seasonPipe);
    }

    let teamsResult = await Fight.aggregate(teamsPipeline);

    return teamsResult;
}

//get the top plaers by season
const topPlayers = async(season = null, league = null) => {
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

    //check if league is in query
    if(league !== null){
        let leaguePipe = {
            '$match': {
                'league.name': league
            }
        }
        playersPipeline.unshift(leaguePipe);
    }

    //check if season was in the query
    if(season !== null) {
        let seasonPipe  = {
            '$match': {
                'season.season': season
            }
        }
        
        playersPipeline.unshift(seasonPipe);
    }

    let playersResult = await Fight.aggregate(playersPipeline);

    return playersResult;
}

//get highest action rated fights
const highestAction = async(season = '*', league = '*') => {
    //set for season wildcard or season query
    let seasonSearchAgg;
    if(season === '*'){
        seasonSearchAgg = {
            'wildcard': {
                'query': '*',
                'path': 'season.season',
                allowAnalyzedField: true
            }
        }
    }  else {
        seasonSearchAgg = {
            'phrase': {
                'query': season,
                'path': 'season.season'
            }
        }
    }

    let leagueSearchAgg;
    if(league === '*'){
        leagueSearchAgg = {
            'wildcard': {
                'query': '*',
                'path': 'league.name',
                allowAnalyzedField: true
            }
        }
    }  else {
        leagueSearchAgg = {
            'phrase': {
                'query': league,
                'path': 'league.name'
            }
        }
    }

    const actionPipeline = [
        {
            '$search': {
                'index': 'fights',
                'compound': {
                    'must': [
                        seasonSearchAgg,
                        leagueSearchAgg
                    ]
                }
            }
        },
        {
            '$sort': {
                'actionRating.average': -1
            }
        },
        {
            '$limit': 5
        }
    ]

    let actionResults = await Fight.aggregate(actionPipeline);

    return actionResults;
}

//get most recently added fights by season
const recentlyAdded = async(season = '*', league = '*') => {
    //set for season wildcard or season query
    let seasonSearchAgg;
    if(season === '*'){
        seasonSearchAgg = {
            'wildcard': {
                'query': '*',
                'path': 'season.season',
                allowAnalyzedField: true
            }
        }
    }  else {
        seasonSearchAgg = {
            'phrase': {
                'query': season,
                'path': 'season.season'
            }
        }
    }

    let leagueSearchAgg;
    if(league === '*'){
        leagueSearchAgg = {
            'wildcard': {
                'query': '*',
                'path': 'league.name',
                allowAnalyzedField: true
            }
        }
    }  else {
        leagueSearchAgg = {
            'phrase': {
                'query': league,
                'path': 'league.name'
            }
        }
    }

    const mostRecentPipeline = [
        {
            '$search': {
                'index': 'fights',
                'compound': {
                    'must': [
                        seasonSearchAgg,
                        leagueSearchAgg
                    ]
                }
            }
        },
        {
            '$sort': {
                'createdAt': -1
            }
        },
        {
            '$limit': 5
        }
    ]

    let mostRecentResults = await Fight.aggregate(mostRecentPipeline);

    return mostRecentResults;
}