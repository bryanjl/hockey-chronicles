const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const errorHandler = require('./middleware/error');
//security
// const mongoSanitize = require('express-mongo-sanitize');
// const helmet = require('helmet');
const cors = require('cors');

const connectDB = require('./config/db');
// const errorHandler = require('./middleware/error');

dotenv.config({ path: './config/config.env' });

//route files
const games = require('./routes/game');
const fights = require('./routes/fight');
const leagues = require('./routes/league');
const players = require('./routes/player');
const seasons = require('./routes/season');
const teams = require('./routes/team');
const auth = require('./routes/auth');
const search = require('./routes/search');


//conect to DB
connectDB();

const app = express();

// logger for dev mode
if(process.env.NODE_ENV === 'development'){
    app.use(morgan('dev')); 
}

// if(Process.env.NODE_ENV === 'production'){
//     app.use(express.static('client/build'));
// }

//uploaded image folders made public
app.use('/uploads', express.static('uploads'));

//cors -> used in production??
// app.use(cors({
//     origin: true,
//     credentials: true
// }));

app.use(function(req, res, next) {
    // res.header("Access-Control-Allow-Origin", 'https://hockey-chronicles-r3lzq.ondigitalocean.app');
    res.header("Access-Control-Allow-Origin", '*');
    res.header("Access-Control-Allow-Credentials", true);
    res.header('Access-Control-Allow-Methods', 'OPTIONS, GET, PUT, DELETE, POST, HEAD');
    res.header('Access-Control-Allow-Headers', '*, Authorization');
    res.header('Access-Control-Request-Headers', '*, Authorization');
    // res.header("Access-Control-Allow-Headers", 'Access-Control-Allow-Headers, Origin, X-Requested-With, Content-Type, Accept, application/json, Authorization, Access-Control-Request-Method, Access-Control-Request-Headers');
    // res.header("Access-Control-Request-Headers", 'Access-Control-Allow-Headers, Origin, X-Requested-With, Content-Type, Accept, application/json, Authorization, Access-Control-Request-Method, Access-Control-Request-Headers');
    next();
});

// response.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");

//body parser
app.use(express.json());

//Sanitize - SQL injection protection
// app.use(mongoSanitize());
// app.use(helmet());

//router mounting
app.use('/api/v1/games', games);
app.use('/api/v1/fights', fights);
app.use('/api/v1/leagues', leagues);
app.use('/api/v1/players', players);
app.use('/api/v1/seasons', seasons);
app.use('/api/v1/teams', teams);
app.use('/api/v1/auth', auth);
app.use('/api/v1/search', search);


//Mount Error handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, console.log(`Server Running on PORT ${PORT}`));

//unhandled promise rejections handler
process.on('unhandledRejection', (err, promise) => {
    console.log(`error: ${err.message}`);
    //close the server
    server.close(() => process.exit(1));
});