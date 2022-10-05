const tdvController = require('../controller/tradingViewController');

const router = require("express").Router();
const ccxt = require('ccxt');
const exchange = new ccxt.binance();

router.get("/test", async(req,res)=>{
    const symbols = await exchange.fetchTickers();
    var result = Object.values(symbols);
    res.send(result); 
});

router.get('/time', tdvController.getTime)

router.get('/config', tdvController.getConfig);


router.get('/symbol_info', (req, res) => {
    console.log("---symbol_info--");
})

router.get('/symbols',tdvController.getSymbolInfo);

router.get('/search', tdvController.searchSymbol);

router.get('/history',tdvController.getHistory);  




module.exports = router;
