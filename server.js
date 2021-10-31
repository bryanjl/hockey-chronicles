const express = require('express');
const dotenv = require('dotenv');
const morgan = require('morgan');
//security
// const mongoSanitize = require('express-mongo-sanitize');
// const helmet = require('helmet');
// const cors = require('cors');

const connectDB = require('./config/db');
// const errorHandler = require('./middleware/error');

dotenv.config({ path: './config/config.env' });

//route files
const fights = require('./routes/fight');

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


//error handler
// app.use(errorHandler);

const PORT = process.env.PORT || 5000;

app.listen(PORT, console.log(`Server Running on PORT ${PORT}`));

