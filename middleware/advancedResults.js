// const advancedResults = (model, populate, sortBy) => async (req, res, next) => {
//     //build our query
//     let query;

//     //copy req.query object
//     let reqQuery = { ...req.query };

//     //list of fields not include in query
//     const removeFields = ['select', 'sort', 'limit', 'page'];

//     //remove fields from query
//     removeFields.forEach(param => delete reqQuery[param]);

//     //change query params to string
//     let queryStr = JSON.stringify(reqQuery);

//     //change string to match a mongoDB search param
//     queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

//     //change string back to object
//     //This object is used to send to DB for search
//     query = model.find(JSON.parse(queryStr));

//     //SELECT FILTER -> if therre is a select filtering then get proper format to search DB
//     if(req.query.select){
//         let fields = req.query.select.split(',').join(' ');
//         query = query.select(fields);
//         // console.log(query);
//     }

//     //SORT BY -> sort properties of query object
//     if(req.query.sort){
//         sortBy = req.query.sort.split(',').join(' ');
//         query.sort(sortBy);
//     } else {
//         query.sort(sortBy);
//     }

//     // PAGE // LIMIT
//     const page = parseInt(req.query.page, 10) || 1;
//     const limit = parseInt(req.query.limit, 10) || 25;
//     const startIndex = (page - 1) * limit;
//     const endIndex = page * limit;
//     const total = await model.countDocuments();

//     query = query
//                 .skip(startIndex)
//                 .limit(limit);

//     //if there is something to be populated
//     if(populate) {
//         query = query.populate(populate);
//     }
    
//     //Execute search and get resources
//     const results = await query;

//     //PAGINATION
//     let pagination = {};
//     pagination.totalPages = Math.ceil(total / limit);
//     if(endIndex < total){
//         pagination.next = {
//             page: page + 1,
//             limit: limit
//         }
//     }
//     if(startIndex > 0) {
//         pagination.prev = {
//             page: page - 1,
//             limit: limit
//         }
//     } 

//     //save to res object to be used in controller
//     res.advancedResults = {
//         success: true,
//         count: results.length,
//         pagination,
//         data: results
//     }

//     next();
// }



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
                        // ,
                        // fuzzy: {}
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
        // {$lookup: {
        //     from: "Fight",
        //     let: {fightId: "$fights"},
        //     pipeline: [
        //         {
        //             $match: {
        //                 $expr: {
        //                     $in: [ "$_id", "$$fightId" ]
        //                 }
        //             }
        //         }]
        //     ,
        //     as: "figs"
        // }},
        sort,
        {$skip: startIndex},
        {$limit: limit}
    ]);

    // console.log(query);
    
    // get query results with limit
    result = await model.aggregate(query);

    //save to res object to be used in controller
    res.advancedResults = {
        success: true,
        pagination,
        data: result
    }    

    next();    
}


module.exports = advancedResults;