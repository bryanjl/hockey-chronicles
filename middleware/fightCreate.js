const { createFight } = require('../controllers/helpers/createFight')

exports.fightCreate = async (req, res, next) => {
    if(!req.body.players){
        console.log('no fight created');
        return next();
    }
    let fight = await createFight(req);

    req.body.fightId = fight._id;
    next();
};