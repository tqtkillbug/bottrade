const mongoose = require('mongoose');

const symbol = mongoose.Schema(
    {
        symbol:{
            type:String,
            require: true
        },
        symbolName:{
            type:String,
            require: true
        },
        exchange:{
            type:String,
            require: true
        },
        isValid:{
            type:Number,
            require:true
        }
    },
    {timestamps : true}
)

var Symbol = mongoose.model('Symbol', symbol);

module.exports = {Symbol};