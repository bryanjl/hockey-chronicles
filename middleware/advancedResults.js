const advancedResults = (model, sortBy, searchIndex, populate = '') => async(req, res, next) => {
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

    // console.log(req.query);

    if(req.query.season && !req.query.league){
        query = [
            {
              '$search': {
                'index': 'fights',
                'text': {
                  'query': req.query.season,
                  'path': {
                    'wildcard': 'season*'
                  }
                }
              }
            }
          ]
    } else if(req.query.season && req.query.league){
        query = [
            {
              '$search': {
                'index': 'fights',
                'text': {
                  'query': req.query.season,
                  'path': {
                    'league': '*',
                    'season': '*'
                  }
                }
              }
            }
          ]
    } else if(req.query.league && !req.query.season){
        query = [
            {
                $match: {
                    'league.name': req.query.league
                }
            }
        ]
    } else if(req.query.term){
        query = [
            {
              '$search': {
                'index': 'fights',
                'text': {
                  'query': req.query.term,
                  'path': {
                    'wildcard': '*'
                  }
                }
              }
            }
          ]
    } else {
        query = [
            {$match: {}}
        ]
    }
    
    //get the total results with no limit
    // let result = await model.aggregate(query);
    //add totals to pagination
     let totalDocuments;
    if(!req.query.season && !req.query.league && !req.query.term){
        totalDocuments = await model.count();
    } else {
        let result = await model.aggregate(query);
        totalDocuments = result.length
    }
    

    pagination.totalDocuments = totalDocuments;
    pagination.totalPages = Math.ceil(totalDocuments / limit);
    

    let sort = {};
    sort.$sort = {};
    sort.$sort[`${sortBy}`] = 1;
    // console.log(sort);

    //push the limit, sort and skip to the query
    query = query.concat([
        sort,
        {$skip: startIndex},
        {$limit: limit}
    ]);

    // console.log(query);
    result = await model.aggregate(query);

    // if(!req.query.term){
    //     totalDocuments = await model.count();
    // } else {
    //     totalDocuments = result.length;
    // }

    // get query results with limit
    

    // console.log('here', populate);

    if(populate !== ''){
        await model.populate(result, {path: populate});
    }
    

    //save to res object to be used in controller
    res.advancedResults = {
        success: true,
        pagination,
        data: result
    }    

    next();    
}


module.exports = advancedResults;