const ErrorResponse = require('../utils/ErrorResponse');

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

  console.log(searchIndex)
  if(searchIndex === 'fights' || searchIndex === 'games'){
    
    if(req.query.season && req.query.league){
      query = [
        {
          '$search': {
            'index': searchIndex,
            'compound': {
              'must': [
                {
                  'phrase': {
                    'query': req.query.season,
                    'path': 'season.season',
                  }
                },
                {
                  'phrase': {
                    'query': req.query.league,
                    'path': 'league.name'
                  }
                }
              ]
            }
          }
        },
        // {
        //   '$project': { 'league.fights': 0, 'league.games': 0 }
        // }
      ]
    } else if (req.query.league && !req.query.season) {
      query = [
        {
          '$search': {
            'index': searchIndex,
            'phrase': {
              'query': req.query.league,
              'path': 'league.name'
            },
          }
        },
        // {
        //   '$project': { 'league.fights': 0, 'league.games': 0 }
        // }
      ]
    } else if (req.query.season && !req.query.league) {
      query = [
        {
          '$search': {
            'index': searchIndex,
            'phrase': {
              'query': req.query.season,
              'path': 'season.season'
            },
          }
        },
        // {
        //   '$project': { 'league.fights': 0, 'league.games': 0 }
        // }
      ]
    } else if (req.query.term) {
      query = [
        {
          '$search': {
            'index': searchIndex,
            'text': {
              'query': req.query.term,
              'path': {
                'wildcard': '*'
              }
            }
          }
        },

      ]
    } else {
      console.log('here')
      query = [
        {
          '$match': {}
        }
      ]
    }
  }

  if (searchIndex === 'players') {
    query = [
      {
        '$search': {
          'index': searchIndex,
          'text': {
            'query': req.query.term,
            'path': {
              'wildcard': '*'
            },
            // fuzzy: {'maxEdits': 2.0}
          }
        }
      },
    ]
  }

  try {
    
  let sort = {};
  sort.$sort = {};
  sort.$sort[`${sortBy}`] = 1;

  //push the limit, sort and skip to the query
  query = query.concat([
      sort,
      {
        '$project': { 'league.fights': 0, 'league.games': 0 }
      },
     
      {
        '$facet': {
          'results': [      
            {$skip: startIndex},
            {$limit: limit}
          ],
        }
      }
  ]);

  // console.log(query)

  result = await model.aggregate(query,  { 'allowDiskUse': true });
  // let totalDocuments = result[0].totalCount[0].totalCount;

  // pagination.totalDocuments = totalDocuments;
  // pagination.totalPages = Math.ceil(totalDocuments / limit);

  result = result[0].results

  //save to res object to be used in controller
  res.advancedResults = {
      success: true,
      pagination,
      data: result
  }    

  next();   
} catch (error) {
  console.log(error);
  return next(new ErrorResponse(`Server Error`, 500))
}
}


module.exports = advancedResults;