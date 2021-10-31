const asyncHandler = require('../middleware/async');
const Fight = require('../models/Fight');

exports.getFight = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: `route to get a fight from collection using ID of ${req.params.id}`
    })
    
    // let fight = await Fight.findById(req.params.id);

    // res.status(200).json({
    //     success: true,
    //     data: fight
    // });
});

exports.createFight = asyncHandler(async (req, res, next) => {
    res.status(200).json({
        success: true,
        message: 'route to create a new fight'
    })

    // let fight = await Fight.create(req.body);

    // res.status(201).json({
    //     success: true,
    //     data: fight
    // });
});