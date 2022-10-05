const {
    Ohlcv
} = require("../model/ohlcv.model");
const {
    Symbol
} = require("../model/symbos.model");
const ccxt = require('ccxt');
const {
    performance
} = require('perf_hooks');
var mapSince = new Map()
class FectchData {
    constructor() {
        this.exchange = new ccxt.binance({
            enableRateLimit: true
        });
        this.exchangeId = this.exchange.id.toUpperCase();
        this.timeframes = ["1m", "15m", "1h", "4h", "1d"];
        this.symbols = ["BTCUSDT", "ETHUSDT", "ADAUSDT", "XRPUSDT", "SOLUSDT", "MATICUSDT", "ETCUSDT", 'LINKUSDT', 'FTTUSDT', 'ATOMUSDT', "LUNCUSDT"];
        this.since = undefined;
    }

    async initDataToBd() {
        await this.fetchSymbolToDb();
        // await this.fetchOHLCV();
    }

    async fecthLstSymbolValid(){
        const listSymbobValid = await Symbol.find({
           isValid : 1,
           exchange : this.exchangeId
        });

      return listSymbobValid;
  }


    async loopTimeframe(symbol) {
        try {
            const lstTime = this.timeframes;
            const loopDataSymbolByTimeframe = lstTime.map(t => this.loopFetchSymbol(symbol,t));
            await Promise.all(loopDataSymbolByTimeframe);
        } catch (error) {
            throw new Error();     
        }

    }

    async loopFetchSymbol(symbol, timeframe) {
            try {
                let since = mapSince.get(`${symbol}_${timeframe}`);
                console.log(`${symbol}_${timeframe}_${since}`);
                const ohlcvs = await this.exchange.fetchOHLCV(symbol, timeframe,since);
                const lstData = ohlcvs.map(s => this.convertDataOhlcv(s, symbol, timeframe));
                if (ohlcvs.length > 50) {
                    await Ohlcv.insertMany(lstData).then(function () {}).catch(function (error) {
                        throw new Error(error);
                    });
                    mapSince.set(`${symbol}_${timeframe}`,ohlcvs[ohlcvs.length - 11][0]);
                } else {
                    console.log(`Close price Binance ${lstData[lstData.length-1].close}_time_${lstData[lstData.length-1].timestamp}_timeFrame_${timeframe}`);
                    await this.loopUpdateToDb(lstData);
                    //    await this.exchange.sleep(500)
                }
                await this.exchange.sleep(1500)
            } catch (e) {
                throw new Error(e);
            }
    }


    async fetchOHLCV() {
        await Ohlcv.collection.drop();
        try {
            await this.exchange.loadMarkets();
            while (true) {
              await this.loopTimeframe("BTCUSDT");
            }
        } catch (error) {
            throw new Error(error);
        }
    }

    async loopUpdateToDb(list) {
        try {
            let count = 0;
            var startTime = performance.now()
            for (let i = 0; i < list.length; i++) {
                const e = list[i];
                let updatedE = await Ohlcv.findOneAndUpdate({
                    timestamp: e.timestamp,
                    exchanges: e.exchanges,
                    symbol: e.symbol,
                    timeframe: e.timeframe
                }, {
                    open: e.open,
                    high: e.high,
                    low: e.low,
                    close: e.close,
                    volume: e.volume
                }, {
                    new: true,
                    upsert: true
                });
                if (updatedE) {
                    count++;
                }
            }
            var endTime = performance.now()
            console.log(`Update ` + count + ` document with ${(endTime - startTime)}s`);
        } catch (error) {
            throw new Error(error)
        }
    }

   
    async fetchSymbolToDb() {
        try {
            const symbols = await this.exchange.fetchTickers();
            const listSymbol = Object.values(symbols)
                .map(e => this.convertDataSymbol(e, this.exchangeId))
                .filter(e => {
                    return e.symbol.includes("USDT");
                });
        //    for (let o = 0; o < listSymbol.length; o++) {
        //     if (o < 50) {
        //         listSymbol[o].isValid = 1;
        //         listSymbol[o].symbolName += "_USE";
        //     }      
        //    }
            Symbol.insertMany(listSymbol).then(function (result) {
                console.log("Insert Symbol Success");
            })
        } catch (error) {
            throw new Error(error);
        }


    }

    convertDataOhlcv(s, symbol, time) {
        const obj = new Ohlcv({
            timestamp: s[0],
            open: s[1],
            high: s[2],
            low: s[3],
            close: s[4],
            volume: s[5],
            exchanges: this.exchangeId,
            symbol: symbol,
            timeframe: time
        });
        return obj;
    }

    convertDataSymbol(e, exchangeId) {
        const obj = new Symbol({
            symbol: e.symbol,
            symbolName: e.info.symbol,
            exchange: exchangeId,
            isValid: 0
        });
        return obj;
    }

}

// module.exports = FectchData;
module.exports = FectchData;