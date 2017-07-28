import autobahn from 'autobahn';
import {$bus} from './event-bus';

const WSURI = "wss://api.poloniex.com";
let connection = new autobahn.Connection({
  url: WSURI,
  realm: "realm1"
});

connection.onopen = function (session) {
    $bus.$emit('poloniex-open');

    function tickerEvent (args,kwargs) {
        let currencyPair = args[0].split('_');

        var response = {
            currencyFrom: currencyPair[0],
            currencyTo: currencyPair[1],
            currencyPair: args[0], 
            last: args[1],
            lowestAsk: args[2], 
            highestBid: args[3], 
            percentChange: args[4], 
            baseVolume: args[5], 
            quoteVolume: args[6], 
            isFrozen: args[7], 
            high24hr: args[8], 
            low24hr: args[9]
        };
        $bus.$emit('poloniex-ticker', response);
        $bus.$emit('poloniex-ticker-'+currencyPair[0], response);
    }
    session.subscribe('ticker', tickerEvent);
}


connection.onclose = function () {
    $bus.$emit('poloniex-close');
}

export default {
    init(){
        connection.open()
    }
}
