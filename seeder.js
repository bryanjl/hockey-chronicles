const mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config({ path: './config/config.env' });

const Player = require('./models/Player');

exports.connectDB = async() => {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
        // useCreateIndex: true,
        // useFindAndModify: false,
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    console.log(`DB Connected ${conn.connection.host}`);

    
}

exports.deleteDB = async() => {
    await Player.deleteMany();
    console.log(`Data Deleted`);
}

exports.seedPlayer = async(first, last, position) => {
    await Player.create({ firstName: first, lastName: last, position })

    // console.log('Players Seeded')
} 



