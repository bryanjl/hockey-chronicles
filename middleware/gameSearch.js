const Game = require('../models/Game');

const gameSearch = () => async(req, res, next)=> {

    let query = [];

    if(req.query.season && req.query.league){
        query = [
            {
                $match: {
                    $and: [
                        { 'season.season': req.query.season },
                        { 'league.league': req.query.league }
                    ]
                    
                }
            }
        ];
    } 

    else if(req.query.season && !req.query.league){
        query = [
            {
                $match: {
                    $and: [
                        { 'season.season': req.query.season }
                    ]
                    
                }
            }
        ];
    }

    else if(req.query.league && !req.query.season){
        query = [
            {
                $match: {
                    $and: [
                        { 'league.league': req.query.league }
                    ]
                    
                }
            }
        ];
    } else {
        query = [
            {
                $match: {}
            }
        ]
    }

    //sort by date
    let sort = {};
    sort.$sort = {};
    sort.$sort[`date`] = 1;
    //add sort and limit to the query
    query = query.concat([
        sort,
        {$limit: 50}
    ]);

    let results = await Game.aggregate(query);  

    res.gameSearch = {
        success: true,
        data: results
    }

    next();
}

module.exports = gameSearch;