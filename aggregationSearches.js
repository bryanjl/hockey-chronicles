
//this pipeline gives top 5 teams with most fights by season
//on the fight model
const pipeline = [
    {
      '$match': {
        'season.season': '1960-1961'
      }
    }, {
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
  ]


//on model team sort and send back fights by season
//need a good way to label the seasons - group?
  const pipeline = [
    {
      '$lookup': {
        'from': 'fights', 
        'localField': 'fights', 
        'foreignField': '_id', 
        'as': 'fightInfo'
      }
    }, {
      '$unwind': {
        'path': '$fightInfo'
      }
    }, {
      '$match': {
        'fightInfo.season.season': '1994-1995'
      }
    }, {
      '$sort': {
        'fightInfo.date': 1
      }
    }, {
      '$project': {
        'fightInfo': '$fightInfo'
      }
    }
  ]