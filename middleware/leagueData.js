//league model
const League = require('../models/League');
const Fight = require('../models/Fight');
const Game = require('../models/Game');
//middlewear
const ErrorResponse = require('../utils/ErrorResponse');

const leagueData = () => async(req, res, next) => {
    //Pagination
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 50;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;

    let pagination = {
        page,
        limit
    }

    let league = await League.findById(req.params.id);

    // pagination.totalFightDocuments = league.fights.length;
    // pagination.totalGameDocuments = league.games.length;

    if(!league){
        return next(new ErrorResponse(`Cannot find league`, 404));
    }

    if(req.query.term === 'games'){
        let returnGameIDs = league.games.slice(startIndex, endIndex);
        pagination.totalDocuments = league.games.length;
        pagination.page = page;
        pagination.totalPages = Math.ceil(pagination.totalDocuments / limit);

        let returnedGames = await Game.find({
            '_id': { $in:
                returnGameIDs
            }
        }).sort({'date': 1}); //sort only works on the subset of the array ?!

        res.leagueData = {
            data: returnedGames
        }
        res.leaguePagination = {
            pagination
        }
    }

    else if(req.query.term === 'fights'){
        let returnedFightIDs = league.fights.slice(startIndex, endIndex);
        pagination.totalDocuments = league.fights.length;
        pagination.page = page;
        pagination.totalPages = Math.ceil(pagination.totalDocuments / limit);

        let returnedFights = await Fight.find({
            '_id': { $in:
                returnedFightIDs
            }
        }).sort({'date': 1}); //sort only works on the subset of the array ?!

        res.leagueData = {
            data: returnedFights
        }
        res.leaguePagination = {
            pagination
        }
    }

    else {
        res.leagueData = {
            data: []
        }
        res.leaguePagination = {
            pagination: 0
        }
    }
    next();
}

module.exports = leagueData;