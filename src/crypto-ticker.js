import Vue from 'vue'
import CryptoTicker from './CryptoTicker.vue'
import $bus from './event-bus'

import poloniex from './poloniex'

window.CryptoTicker = {
  init(config){
    config = config || {
      entry: '#app',
      coins: [],
      fee: 0.00
    };
    poloniex.init();
    let $vm = new Vue({
      el: config.entry,
      extra: config,
      render: h => h(CryptoTicker),
    });
    return $vm;
  }
}


