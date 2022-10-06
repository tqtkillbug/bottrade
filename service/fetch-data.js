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
const logger = require("../common/logger");
var mapSince = new Map()
class FectchData {
    constructor() {
        this.exchange = new ccxt.binance({
            enableRateLimit: true
        });
        this.exchangeId = this.exchange.id.toUpperCase();
        this.timeframes = ["1m", "15m", "1h", "4h", "1d"];
    }

    async initDataToBd() {
        await this.fetchSymbolToDb();
        // await this.fetchOHLCV();
    }

    async fecthLstSymbolValid() {
        const listSymbobValid = await Symbol.find({
            isValid: 1,
            exchange: this.exchangeId
        });
        return listSymbobValid;
    }


    async loopTimeframe(symbol) {
        try {
            const lstTime = this.timeframes;
            for await (const time of lstTime) {
                await this.loopFetchSymbol(symbol, time)
            }
            return true;
        } catch (error) {
            logger.error(error);
            throw new Error();
        }

    }

    async loopFetchSymbol(symbol, timeframe) {
        try {
            let since = mapSince.get(`${symbol}_${timeframe}`);
            logger.info(`Fetching From Binance_${symbol}_${timeframe}_${since}`)
            const ohlcvs = await this.exchange.fetchOHLCV(symbol, timeframe, since);
            const lstData = ohlcvs.map(s => this.convertDataOhlcv(s, symbol, timeframe));
            if (ohlcvs.length > 50) {
                await Ohlcv.insertMany(lstData).then(function () {
                    logger.info(`Insert success_${symbol}_${timeframe}_${since}`)
                    mapSince.set(`${symbol}_${timeframe}`, ohlcvs[ohlcvs.length - 11][0]);
                }).catch(function (error) {
                   logger.error(error);
                    throw new Error(error);
                });
            } else {
                await this.loopUpdateToDb(lstData,symbol, timeframe);
            }
            await this.exchange.sleep(800)
        } catch (e) {
            logger.error(error);
            throw new Error(e);
        }
    }




    async fetchOHLCV() {
        try {
            logger.info("Start Fetch OHLCV From Binance To Mongo DB");
            await this.exchange.loadMarkets();
            const listSymbolValid = await this.fecthLstSymbolValid();
            mapSince = await this.getTimeStapOfSymbol();
            while (true) {
                logger.info("New loop Symbol");
                for await (const s of listSymbolValid) {
                    await this.loopTimeframe(s.symbolName);
                }
            }
        } catch (error) {
            logger.error(error);
            throw new Error(error);
        }
    }

    async loopUpdateToDb(list,symbol, timeframe) {
        try {
            let count = 0;
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
            logger.info(`Update: ${count} | Symbol: ${symbol} | Time: ${timeframe}`);
        } catch (error) {
            logger.error(error);
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
            logger.error(error);
            throw new Error(error);
        }


    }

    async getTimeStapOfSymbol(){
        let mapSinceDB = new Map();
        const symbolsValid = await this.fecthLstSymbolValid();
        const lstTimeFrame = this.timeframes;
        for await (const symbol of symbolsValid) {
            for await (const time of lstTimeFrame) {
                const ohlcvMaxTimeStamp = await Ohlcv.find({symbol:symbol.symbolName, timeframe: time})
                                                          .sort({timestamp : -1}).limit(1);
                    if (ohlcvMaxTimeStamp[0]) {
                    mapSinceDB.set(`${symbol.symbolName}_${time}`,ohlcvMaxTimeStamp[0].timestamp);
                } else {
                   
                    mapSinceDB.set(`${symbol.symbolName}_${time}`,undefined);
                }
            }
        }
        console.log(mapSinceDB);
        return mapSinceDB;
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