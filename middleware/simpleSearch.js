const simpleSearch = (model, sortBy, fieldsToSearch) => async(req, res, next) => {
    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    
    let pagination = {
        page,
        limit
    }

    let query;

    if(req.query.term){
        let fields = [];
        fieldsToSearch.forEach(field => {
            let obj = {};
            obj[field] = new RegExp(req.query.term, 'i');
            fields.push(obj)
        });

        query = [
            { $match: { $or: fields }}
        ];
    } else {
        query = [
            {$match: {}}
        ];
    }

    let result = await model.aggregate(query);

    let totalDocuments = result.length;
    pagination.totalDocuments = totalDocuments;
    pagination.totalPages = Math.ceil(totalDocuments / limit);

    let sort = {};
    sort.$sort = {};
    sort.$sort[`${sortBy}`] = 1;

    //push the limit, sort and skip to the query
    query = query.concat([
        sort,
        {$skip: startIndex},
        {$limit: limit}
    ]);

    result = await model.aggregate(query);

    res.simpleSearch = {
        success: true,
        pagination,
        data: result
    }

    next();
}

module.exports = simpleSearch;