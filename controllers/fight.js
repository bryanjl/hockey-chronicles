const asyncHandler = require('../middleware/async');
const Fight = require('../models/Fight');

//@desc     Get a fight by ID
//@route    GET /api/v1/fights/:id
//@access   Public
exports.getFight = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: `route to get a fight from collection using ID of ${req.params.id}`
    })
});

//@desc     Create a new fight
//@route    POST /api/v1/fights/
//@access   Private - logged in user
exports.createFight = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: 'route to create a new fight'
    });
});

//@desc     Update a fight by ID
//@route    PUT /api/v1/fights/:id
//@access   Private - logged in user
exports.updateFight = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: `Route for updating a fight by ID of ${req.params.id}`
    });
});

//@desc     Delete a fight by ID
//@route    DELETE /api/v1/fights/:id
//@access   Private - logged in user
exports.deleteFight = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: `Route for deleting a fight by id of ${req.params.id}`
    });
});

