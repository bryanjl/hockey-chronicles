const Game = require('../models/Game');

const gameSearch = () => async(req, res, next)=> {

    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    let pagination = {
        page,
        limit
    }

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
    } else if(req.query.term) {
        query = [
            {
                $match: {
                    
                }
            }
        ]
    }
    
    else {
        query = [
            {
                $match: {}
            }
        ]
    }

        //get the total results with no limit
    // let result = await model.aggregate(query);
    //add totals to pagination
    let totalDocuments;
    if(!req.query.season && !req.query.league && !req.query.term){
        totalDocuments = await Game.count();
    } else {
        let result = await Game.aggregate(query);
        totalDocuments = result.length
    }
    

    pagination.totalDocuments = totalDocuments;
    pagination.totalPages = Math.ceil(totalDocuments / limit);

    //sort by date
    let sort = {};
    sort.$sort = {};
    sort.$sort[`date`] = 1;
    //add sort and limit to the query
    query = query.concat([
        sort,
        {$skip: startIndex},
        {$limit: 50}
    ]);

    let results = await Game.aggregate(query);  

    res.gameSearch = {
        success: true,
        pagination,
        data: results
    }

    next();
}

module.exports = gameSearch;