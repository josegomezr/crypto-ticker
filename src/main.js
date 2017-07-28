import Vue from 'vue'
import App from './App.vue'

import poloniex from './poloniex'

window._COINS = window._COINS || ['BTC', 'XMR', 'LTC', 'DASH', 'NXT', 'STR', 'XRP', 'ETH']

poloniex.init();

new Vue({
  el: '#app',
  render: h => h(App)
})
