const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/ErrorResponse');

const Fight = require('../models/Fight');
const Player = require('../models/Player');

exports.searchFights = asyncHandler(async (req, res, next) => {
    let result = await Fight.aggregate([
        {
            $search: {
                index: "custom",
                text: {
                    query: `${req.query.term}`,
                    path: {
                        wildcard: '*'
                    }
                    
                }
            }
        },
        {
            $limit : 5
        }
    ]);
    res.status(200).json({
        success: true,
        data: result
    });
});

// "$search": {
//     "index": "default",
//     "text": {
//         "query": `${req.query.term}`,
//         "path": "date"
//     }
// }