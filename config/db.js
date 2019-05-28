const mongoose = require('mongoose');
const config = require('config');

const db = config.get('mongoURI');
const url = config.get('url');
const usr = config.get('usr');
const pass = config.get('pass');
const nurl = config.get('nurl');

const connectDB = async () => {
    try {
        await mongoose.connect(db, {useNewUrlParser: true, useCreateIndex: true, useFindAndModify: false});
        //await mongoose.connect(nurl, {useNewUrlParser: true});
        console.log('mongoDB connected');
    } catch (err) {
        console.error(err.message);
        //exit process with failure
        process.exit(1);
    }
};

module.exports = connectDB;