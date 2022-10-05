const {Ohlcv} = require("../model/ohlcv.model");
const UDF = require("../service/udf-trading-view");
const udf = new UDF();

function handlePromise(res, next, promise) {
    promise.then(result => {
        res.send(result)
    }).catch(err => {
        next(err)
    })
}

module.exports = {
    
  getConfig : (req,res,next)=>{
    handlePromise(res,next,udf.config());
  },

  getTime :(req,res,next)=>{
    const time = Math.floor(Date.now() / 1000)  
    res.set('Content-Type', 'text/plain').send(time.toString())
  },

  getSymbolInfo: (req,res, next)=>{
    handlePromise(res, next, udf.symbols(req.query.symbol))
  },

  searchSymbol :(req,res, next)=>{
    if (req.query.type === '') {
        req.query.type = null
    }
    if (req.query.exchange === '') {
        req.query.exchange = null
    }
    handlePromise(res, next, udf.search(
        req.query.query,
        req.query.type,
        req.query.exchange,
        req.query.limit
    ))
  },

  getHistory : (req,res, next)=>{
    handlePromise(res, next, udf.history(
        req.query.symbol,
        req.query.from,
        req.query.to,
        req.query.resolution
    ))
  }


}