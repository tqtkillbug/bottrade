const express = require('express')
const app = express()
const cors = require('cors')
app.use(cors())
// const morgan = require('morgan')
// app.use(morgan('tiny'))

app.set("views","chart");
app.set("view engine","ejs");
app.use(express.static("public"));
const ccxt = require('ccxt');
const mongoose = require('mongoose');
const {Ohlcv} = require("./model/ohlcv.model");
const logger = require("./common/logger");
logger.stream = {
  write: function(message, encoding){
      logger.info(message);
  }
};
app.use(require("morgan")("combined", { "stream": logger.stream }));
const tdvRoute = require('./routers/trading-view-client');
const appRoute = require('./routers/app.route');

const fetchData = require('./service/fetch-data');
const fectchDataService = new fetchData();

const port = 80 
app.listen(port, () => {
    console.log(`API listening on port ${port}`)
})


// const MONGODB_URL = 'mongodb+srv://tqttestfull:QulFZDx0B3HkFFEb@bottradetestv1.uv7mioh.mongodb.net/?retryWrites=true&w=majority';

//Db on vps
const MONGODB_URL = 'mongodb://38.242.217.135:27017';
// const MONGODB_URL = 'localhost:27017';
const BINANCE_API_KEY = "olOAqfvxf4mY7wPk2lQnRItKdbtPOCxiwDRiSYc0FTu4Mp8zDDeQEaW7z32RjzOB";
const BINANCE_SECRET_KEY = "15fdML5Gv5VZgYQojP99PNYeQ4RqCcqU1IPN8CWf0zrJFnY0FdaUa8W6e61ebzlJ";

mongoose.connect(MONGODB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
},() => {
  console.log("Mongo is ready!!!!");
  // fectchDataService.fetchSymbolToDb();
  fectchDataService.fetchOHLCV();
})

app.use('/api', tdvRoute);

app.use("/",appRoute);

// app.get('/',(req,res)=>{
//      res.send("This Is API DATA For Trading View Chart");
// });

