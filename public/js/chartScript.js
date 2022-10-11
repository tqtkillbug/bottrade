
function getParameterByName(name) {
    name = name.replace(/[\[]/, "\\[").replace(/[\]]/, "\\]");
    var regex = new RegExp("[\\?&]" + name + "=([^&#]*)"),
        results = regex.exec(location.search);
    return results === null ? "" : decodeURIComponent(results[1].replace(/\+/g, " "));
}

function getCurrentHost() {
    return window.location.protocol + "//" + window.location.host; 
}

function initOnReady() {
    // var datafeedUrl = "https://demo-feed-data.tradingview.com";
    // var customDataUrl = getParameterByName('dataUrl');
    // if (customDataUrl !== "") {
    //     datafeedUrl = customDataUrl.startsWith('https://') ? customDataUrl : `https://${customDataUrl}`;
    // }
    
    var datafeedUrl = getCurrentHost() + '/api'
    console.log(datafeedUrl);
    var widget = window.tvWidget = new TradingView.widget({
        // debug: true, // uncomment this line to see Library errors and warnings in the console
        fullscreen: true,
        symbol: 'BTCUSDT',
        interval: '1D',
        container: "tv_chart_container",

        //	BEWARE: no trailing slash is expected in feed URL
        // datafeed: new Datafeeds.UDFCompatibleDatafeed('http://localhost:8668/api'),
        datafeed: new Datafeeds.UDFCompatibleDatafeed(datafeedUrl),
        library_path: "charting_library/",
        locale: getParameterByName('lang') || "en",
        disabled_features: ["use_localstorage_for_settings"],
        enabled_features: ["study_templates"],
        charts_storage_url: 'https://saveload.tradingview.com',
        charts_storage_api_version: "1.1",
        client_id: 'tradingview.com',
        user_id: 'public_user_id',
        theme: getParameterByName('theme'),
        // theme: 'dark',
    });
};

window.addEventListener('DOMContentLoaded', initOnReady, false);
