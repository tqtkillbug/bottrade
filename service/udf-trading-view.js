const ccxt = require('ccxt');
const { Ohlcv} = require('../model/ohlcv.model');
const {Symbol} = require('../model/symbos.model');
const RESOLUTIONS_INTERVALS_MAP = {
    '1': '1m',
    '3': '3m',
    '5': '5m',
    '15': '15m',
    '30': '30m',
    '60': '1h',
    '120': '2h',
    '240': '4h',
    '360': '6h',
    '480': '8h',
    '720': '12h',
    'D': '1d',
    '1D': '1d',
    '3D': '3d',
    'W': '1w',
    '1W': '1w',
    'M': '1M',
    '1M': '1M',
}

class UDF {
    constructor() {
        // this.exchange = new ccxt.binance({ enableRateLimit: true });
        this.exchangeId = "BINANCE"
        // this.supportedResolutions = ['1', '3', '5', '15', '30', '60', '120', '240', '360', '480', '720', '1D', '3D', '1W', '1M']
        this.supportedResolutions = ['1', '15', '60', '240', '1D']
        this.loadSymbols();
        // setInterval(() => {
        //     this.loadSymbols()
        // }, 50000)
    }

    async loadSymbols() {
        const symbols = await Symbol.find({
            exchange: this.exchangeId
        });
        this.lstsymbols = symbols;
        console.log("Success load symbols from mongo db");
    }


    async config() {
        return {
            exchanges: [{
                value: 'BINANCE',
                name: 'Binance',
                desc: 'Binance Exchange'
            }],
            symbols_types: [{
                value: 'crypto',
                name: 'Cryptocurrency'
            }],
            supported_resolutions: this.supportedResolutions,
            supports_search: true,
            supports_group_request: false,
            supports_marks: false,
            supports_timescale_marks: false,
            supports_time: true
        }
    }

    async symbols(symbol) {
            const symbolInfo = await Symbol.findOne({
                symbolName: symbol,
            })
            return {
                symbol: symbolInfo.symbolName,
                ticker: symbolInfo.symbolName,
                name: symbolInfo.symbolName,
                full_name: symbolInfo.symbolName,
                description: symbolInfo.symbol,
                exchange: symbolInfo.exchange,
                listed_exchange: symbolInfo.exchange,
                type: 'crypto',
                currency_code: 'USDT',
                session: '24x7',
                timezone: 'UTC',
                minmovement: 1,
                minmov: 1,
                minmovement2: 0,
                minmov2: 0,
                pricescale: 100,
                supported_resolutions: this.supportedResolutions,
                has_intraday: true,
                has_daily: true,
                has_weekly_and_monthly: true,
                data_status: 'streaming'
            }
    }

    // async history(symbol, from, to, resolution) {
    //     console.log(from);
    //     console.log(to);
    //     const RESOLUTIONS_INTERVALS_MAP = {
    //         '1': '1m',
    //         '3': '3m',
    //         '5': '5m',
    //         '15': '15m',
    //         '30': '30m',
    //         '60': '1h',
    //         '120': '2h',
    //         '240': '4h',
    //         '360': '6h',
    //         '480': '8h',
    //         '720': '12h',
    //         'D': '1d',
    //         '1D': '1d',
    //         '3D': '3d',
    //         'W': '1w',
    //         '1W': '1w',
    //         'M': '1M',
    //         '1M': '1M',
    //     }
    //     const interval = RESOLUTIONS_INTERVALS_MAP[resolution]
    //     let totalKlines = []
    //     from *= 1000
    //     to *= 1000
    //     while (true) {
    //        const ohlcv = await new ccxt.binance().fetchOHLCV(symbol, interval);
    //         console.log(ohlcv.length);
    //          totalKlines = totalKlines.concat(ohlcv)
    //                 return {
    //                     s: 'ok',
    //                     t: totalKlines.map(b => Math.floor(b[0] / 1000)),
    //                     c: totalKlines.map(b => parseFloat(b[4])),
    //                     o: totalKlines.map(b => parseFloat(b[1])),
    //                     h: totalKlines.map(b => parseFloat(b[2])),
    //                     l: totalKlines.map(b => parseFloat(b[3])),
    //                     v: totalKlines.map(b => parseFloat(b[5]))
    //                 } 
    //             }
    // }



    async history(symbol, from, to, resolution) {
        const interval = RESOLUTIONS_INTERVALS_MAP[resolution]
        let totalKlines = []
        from *= 1000
        to *= 1000
        while (true) {
            const ohlcvs = await Ohlcv.find({
                symbol: symbol,
                timeframe: interval,
                timestamp: {"$gte" : from},
            });
            console.log(`Price from DB_${ohlcvs[ohlcvs.length-1].close}_time_${ohlcvs[ohlcvs.length-1].timestamp}`);
            // console.log(ohlcvs);
            totalKlines = totalKlines.concat(ohlcvs)
            return {
                s: 'ok',
                t: totalKlines.map(b => Math.floor(b.timestamp / 1000)),
                c: totalKlines.map(b => parseFloat(b.close)),
                o: totalKlines.map(b => parseFloat(b.open)),
                h: totalKlines.map(b => parseFloat(b.high)),
                l: totalKlines.map(b => parseFloat(b.low)),
                v: totalKlines.map(b => parseFloat(b.volume))
            };
        }
    }

    async search(query, type, exchange, limit) {
        var result = this.lstsymbols;
        // if (type) {
        //     symbols = symbols.filter(s => s.type === type)
        // }
        // if (exchange) {
        //     symbols = symbols.filter(s => s.exchange === exchange)
        // }
        query = query.toUpperCase()
        result = result.filter(s => s.symbolName.indexOf(query) >= 0)
        if (limit) {
            result = result.slice(0, limit)
        }
        return result.map(s => ({
            symbol: s.symbolName,
            full_name: s.symbolName,
            description: s.symbol,
            exchange: s.exchange,
            ticker: s.symbol,
            type: 'crypto'
        }))
    }

}

module.exports = UDF;