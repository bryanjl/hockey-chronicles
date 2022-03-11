const advancedResults = (model, sortBy, searchIndex, populate = '') => async(req, res, next) => {
    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    let pagination = {
        page,
        limit
    }

    let query = [];

    if(req.query.term) {
        query = [
            {
                $search: {
                    index: searchIndex,
                    text: {
                        query: `${req.query.term}`,
                        path: {
                            wildcard: `${req.query.path || ''}*`
                        }
                    }
                }
            },
            
        ]
    } else {
        query = [
            {$match: {}}
        ]
    }
    
    //get the total results with no limit
    let result = await model.aggregate(query);
    //add totals to pagination
    let totalDocuments = result.length;
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
    
    // get query results with limit
    result = await model.aggregate(query);

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