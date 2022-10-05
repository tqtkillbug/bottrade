const mongoose = require('mongoose');


const ohlcv = new mongoose.Schema({
    timestamp:{
        type :Number,
        require: true
    },
    open:{
        type :Number,
        require: true
    },
    high:{
        type :Number,
        require: true
    },
    low:{
        type :Number,
        require: true
    },
    close:{
        type :Number,
        require: true
    },
    volume:{
        type :Number,
        require: true
    },
    exchanges:{
        type: String,
        require: true
    },
    symbol: {
        type: String,
        require: true
    },
    timeframe : {
        type: String,
        require: true
    }
})

var Ohlcv = mongoose.model('OHLCV', ohlcv);
module.exports = {Ohlcv};