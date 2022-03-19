const mongoose = require('mongoose');
const dotenv = require('dotenv');
// const fs = require('fs');


dotenv.config({ path: './config/config.env' });

//models

const Season = require('./models/Season');

//connect the DB
const connectDB = async() => {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    });

    console.log(`DB Connected ${conn.connection.host}`);    
}

const seedSeasons = async () => {
    await connectDB();
    for(let i = 1900; i <= 2022; i++){
        await Season.create({ season: `${i}-${i+1}` });
        console.log(`${2022 - i} seasons remaining`);
    }
    process.exit();
}

const deleteSeasons = async () => {
    await connectDB();
    await Season.deleteMany();
    console.log('deleted all seasons')
    process.exit();
}

seedSeasons();
// deleteSeasons();