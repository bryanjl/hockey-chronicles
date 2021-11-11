const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
const errorHandler = require('./middleware/error');
//security
// const mongoSanitize = require('express-mongo-sanitize');
// const helmet = require('helmet');
// const cors = require('cors');

const connectDB = require('./config/db');
// const errorHandler = require('./middleware/error');

dotenv.config({ path: './config/config.env' });

//route files
const fights = require('./routes/fight');
const leagues = require('./routes/league');
const players = require('./routes/player');
const seasons = require('./routes/season');
const teams = require('./routes/team');

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

//cors -> used in production??
// app.use(cors());

//body parser
app.use(express.json());

//Sanitize - SQL injection protection
// app.use(mongoSanitize());
// app.use(helmet());

//router mounting
app.use('/api/v1/fights', fights);
app.use('/api/v1/leagues', leagues);
app.use('/api/v1/players', players);
app.use('/api/v1/seasons', seasons);
app.use('/api/v1/teams', teams);


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


// sportsRadar
// UN: hockeyChronicles
// pw:#mZGj5Ezfa9UHGx

// NHL
// Key: djw7dga533uc7hqstm3dumdf

// global ice hockey
// Key: jvqtfgdrbx5snkrnuxc2yy4s