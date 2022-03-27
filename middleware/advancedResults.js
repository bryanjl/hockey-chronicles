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

  if(searchIndex === 'default'){
    if(req.query.term) {
      query = [
        {
          '$search': {
            'index': 'default',
            'text': {
              'query': req.query.term,
              'path': {
                'wildcard': '*'
              },
              // 'fuzzy': {}
            }
          }
        }
      ]
    } else {
      query = [
        {$match: {}}
      ]
    }
  }

  if(searchIndex === 'fights'){

    if(req.query.season && !req.query.league){
      query = [
        {
          '$search': {
            'index': 'fights',
            'phrase': {
              
                'query': req.query.season,
                'path': 'season.season',
                // 'allowAnalyzedField': true
              },

          }
        }
      ]
    } else if(req.query.season && req.query.league){
      query = [
        {
          '$search': {
            'index': 'fights',
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
        }
      ]
    } else if(req.query.league && !req.query.season){
      query = [
        {
          '$search': {
            'index': 'fights',
            'phrase': {
              
                'query': req.query.league,
                'path': 'league.name'
                // 'allowAnalyzedField': true
              }, 
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
              },
              'fuzzy': {}
            }
          }
        }
      ]
    } else {
      query = [
          {$match: {}}
      ]
    }
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

  //push the limit, sort and skip to the query
  query = query.concat([
      sort,
      {$skip: startIndex},
      {$limit: limit}
  ]);

  result = await model.aggregate(query);

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