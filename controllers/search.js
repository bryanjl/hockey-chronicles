const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/ErrorResponse');

const Fight = require('../models/Fight');
const Player = require('../models/Player');
const Team = require('../models/Team');

//@desc     Search fights records 
//@route    GET /api/v1/search/fights?query
//@access   Public
exports.searchFights = asyncHandler(async (req, res, next) => {
    if(!req.query.path){
        req.query.path = '';
    }
    
    let result = await Fight.aggregate([
        {
            $search: {
                index: "fights",
                text: {
                    query: `${req.query.term}`,
                    path: {
                        wildcard: `${req.query.path}*`
                    },
                    fuzzy: {}
                }
            }
        },
        {
            $limit : 25
        }
    ]);
    res.status(200).json({
        success: true,
        data: result
    });
});

//@desc     Search players records 
//@route    GET /api/v1/search/players?query
//@access   Public
exports.searchPlayers = asyncHandler(async (req, res, next) => {
    if(!req.query.path){
        req.query.path = '';
    }

    let result = await Player.aggregate([
        {
            $search: {
                index: "default",
                text: {
                    query: `${req.query.term}`,
                    path: {
                        wildcard: `${req.query.path}*`
                    },
                    fuzzy: {}
                }
            }
        },
        {
            $limit : 25
        }
    ]);
    res.status(200).json({
        success: true,
        data: result
    });
});

//@desc     Search all indexes 
//@route    GET /api/v1/search?query
//@access   Public
exports.searchTeams = asyncHandler(async (req, res, next) => {
    if(!req.query.path){
        req.query.path = '';
    }

    let result = await Team.aggregate([
        {
            $search: {
                index: "teams",
                text: {
                    query: `${req.query.term}`,
                    path: {
                        wildcard: `${req.query.path}*`
                    },
                    fuzzy: {}
                }
            }
        },
        {
            $limit : 25
        }
    ]);
    res.status(200).json({
        success: true,
        data: result
    });
});
