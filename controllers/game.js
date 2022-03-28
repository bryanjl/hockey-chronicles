const asyncHandler = require('../middleware/async');
const ErrorResponse = require('../utils/ErrorResponse');

//models
const Game = require('../models/Game');
const League = require('../models/League');
const Season = require('../models/Season');
const Team = require('../models/Team');
const Player = require('../models/Player');
const Fight = require('../models/Fight');
const Comment = require('../models/Comment');


//@desc     Get all Games
//@route    GET /api/v1/games
//@access   Public
exports.getAllGames = asyncHandler(async (req, res,next) => {
    // res
    res.setHeader("Access-Control-Allow-Origin", 'https://hockey-chronicles-r3lzq.ondigitalocean.app')
    // res.header("Access-Control-Allow-Origin", '*');
        .setHeader("Access-Control-Allow-Credentials", true)
        .setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, DELETE, POST, HEAD')
        .setHeader('Access-Control-Allow-Headers', '*, Authorization')
        .setHeader('Access-Control-Request-Headers', '*, Authorization')
        .setHeader('Content-Type', 'application/json')
       
        .end(JSON.stringify(res.gameSearch));
        
});

//@desc     Create a new game
//@route    POST /api/v1/games
//@access   Private
exports.createGame = asyncHandler(async (req, res, next) => {
    try {
        let gameInfo = {};
    
        //set date
        gameInfo.date = new Date(req.body.date);

        //set teams
        gameInfo.teams = req.body.teams;

        //set description
        gameInfo.description = req.body.description;

        //set league
        let leagueInstance = await League.findOne({ name: req.body.league });

        let league = {
            id: leagueInstance._id,
            name: leagueInstance.name
        }

        gameInfo.league = league;

        //set season
        let seasonInstance = await Season.findOne({ season: req.body.season });

        let season = {
            id: seasonInstance._id,
            season: seasonInstance.season
        }

        gameInfo.season = season;

        //set gameType
        if(req.body.gameType){
            gameInfo.gameType = req.body.gameType 
        }
        
        //get homeTeam
        if(gameInfo.teams[0].home){
            gameInfo.homeTeam = gameInfo.teams[0].id;
        } else {
            gameInfo.homeTeam = gameInfo.teams[1].id;
        }

        let game = await Game.create(gameInfo);

        //add game to each team's games array
        let team1 = await Team.findById(gameInfo.teams[0].id);
        let team2 = await Team.findById(gameInfo.teams[1].id);

        team1.games.push(game._id);
        team2.games.push(game._id);

        team1.markModified('games');
        team2.markModified('games');

        await team1.save();
        await team2.save();

        //add game to league games
        leagueInstance.games.push(game._id);
        leagueInstance.markModified('games');
        await leagueInstance.save();

        //add game to season games
        seasonInstance.games.push(game._id);
        seasonInstance.markModified('games');
        await seasonInstance.save();


        res.status(200).json({
            success: true,
            data: game
        });
    } catch (error) {
        console.log(error);
    }
});

//@desc     Get a game by ID
//@route    GET /api/v1/games/:id
//@access   Public
exports.getGame = asyncHandler(async (req, res,next) => {
    //find game by ID
    let game = await Game.findById(req.params.id);
    if(!game){
        return next(new ErrorResponse(`Cannot find game with ID of ${req.params.id}`, 404));
    }

    sendPopulatedResponse(game, 200, res);
});

//@desc     Update a game by ID
//@route    PUT /api/v1/games/:id
//@access   Private
exports.updateGame = asyncHandler(async (req, res,next) => {
    // console.log(req.body);

    let game = await Game.findById(req.params.id);

    if(!game){
        return next(new ErrorResponse(`Game with ID of ${req.params.id} not found`, 404));
    }
    
    if(req.body.season){
        //update season
        
        // get the new season
        let season = await Season.findOne({season: req.body.season});
        
        // create the new season object for game model
        let updatedSeason = {
            id: season._id.toString(),
            season: season.season
        }
        //remove the game from current season the game was set to
        await game.updateSeason();

        //add the game to th new season
        season.games.push(game._id);
        season.markModified('games');
        await season.save();

        //update the game's season object
        game.season = updatedSeason;
        game.markModified('season');
        await game.save();

        //already updated can be removed fom the req body
        delete req.body.season;
    }

    if(req.body.teams) {
        //update teams

        let oldTeam = req.body.teams.oldTeam;
        let newTeam = req.body.teams.newTeam;

        let teamsObj = [];
        if(game.teams[0].id === oldTeam.id){
            teamsObj.push(game.teams[1]);
        } else {
            teamsObj.push(game.teams[0]);
        }
        //new teams object for game
        teamsObj.push(newTeam);

        let teamRemoved = await Team.findById(oldTeam.id);
        let teamAdded = await Team.findById(newTeam.id);

        let newGamesOfRemovedTeam = teamRemoved.games.filter(elem => {
            elem !== game._id;
        });

        teamRemoved.games = newGamesOfRemovedTeam;
        teamRemoved.markModified('games');
        await teamRemoved.save();

        teamAdded.games.push(game._id);
        teamAdded.markModified('games');
        await teamAdded.save();

        //method for fight
        await game.updateTeamsFights(oldTeam.id, newTeam.id, teamsObj);
        game.markModified('teams');
        await game.save();

        delete req.body.teams;
    }

    const updatedGame = await Game.findByIdAndUpdate(req.params.id, req.body, {new: true});

    res.status(200).json({
        success: true,
        data: updatedGame
    });
});

//@desc     Delete a game by ID
//@route    DELETE /api/v1/games/:id
//@access   Private
exports.deleteGame = asyncHandler(async (req, res,next) => {
    //!!!Should not be deleting games!!!
    //No function yet
    
    res.status(200).json({
        success: true,
        message: 'route for deleting a game by ID'
    });
});

//@desc     Post a comment to a game using ID
//@route    POST /api/v1/games/:id/comments
//@access   Private - logged in user
exports.postComment = asyncHandler(async (req, res, next) => {
    console.log(req.body);
    if(!req.body.body){
        return next(new ErrorResponse(`Please add a comment`, 400));
    }
    
    let game = await Game.findById(req.params.id);

    if(!game){
        return next(new ErrorResponse(`Game with id of ${req.params.id} not found`, 404));
    }

    let comment = await Comment.create(req.body);

    //add comment to the game
    game.comments.push(comment._id);
    game.markModified('comments');
    await game.save();

    sendPopulatedResponse(game, 200, res);
});

const sendPopulatedResponse = asyncHandler(async (game, statusCode, res) => {
    //populate with data 
game = await Game.findById(game._id)
    .populate('fights', 'players outcome fightType actionRating unfair description eventDescription')
    .populate('comments', 'body createdAt parentId user username');

res.status(statusCode).json({
    success: true,
    data: game
});
});