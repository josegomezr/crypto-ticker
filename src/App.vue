<template>
  <div id="crypto-ticker">
    <div v-if="loading">
      <span class="button is-dark">{{ loading_step }}</span>
    </div>
    <div v-else>
      <input type="text" class="input" placeholder="Comision">
      <table class="table">
        <thead>
          <tr>
            <th>Moneda</th>
            <!-- <th>BTC</th> -->
            <th>USD</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="coin in coins">
            <td>{{ coin.coin }}</td>
            <!--
            <td>{{ coin.btc_value | numbro(8) }} 
              <span v-if="coin.coin != 'BTC'" :class="{'positive': coin.btc_change > 0, 'negative': coin.btc_change < 0, 'stalled': coin.btc_change == 0}">({{coin.btc_change | numbro(2) }}%)</span>
            </td>
            -->
            <td>{{ coin.usd_value | numbro(2) }} 
              <span :class="{'positive': coin.usd_change > 0, 'negative': coin.usd_change < 0, 'stalled': coin.usd_change == 0}">
                ({{coin.usd_change | numbro(2) }}%)
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>

const POLONIEX_URL = "https://poloniex.com/public?command=returnChartData&end=9999999999&period=300"

function poloniex_url(coin) {
  let start = ((+(new Date)/1000)-1000)|0;
  return `${POLONIEX_URL}&currencyPair=BTC_${coin}&start=${start}`
}

import axios from 'axios';
import numbro from 'numbro';
import Q from 'q';
import {$bus} from './event-bus'

export default {
  name: 'app',
  filters: {
    numbro(input, decimalPlaces){
      decimalPlaces = decimalPlaces || 2;
      let fmt = ',0.';
      for(var i = 0; i < decimalPlaces; i++)
        fmt += '0';
      return numbro(input).format(fmt);
    }
  },
  mounted(){
    this.loading_step = 'Conectando con Exchange';
    this.getBaseTicker();

    $bus.$on('poloniex-open', () => {
      this.online = true;
    })
    $bus.$on('poloniex-close', () => {
      this.online = false;
    })
    $bus.$on('poloniex-ticker-USDT', (data) => {
      if (this.loading) {
        return;
      }
      if (this.acceptable_coins.indexOf(data.currencyTo) >= 0) {
        this.updateCurrency(data);
      }
    })
    $bus.$on('poloniex-ticker-BTC', (data) => {
      if (this.loading) {
        return;
      }

      if (this.acceptable_coins.indexOf(data.currencyTo) >= 0) {
        this.updateCurrency(data);
      }
    })
/*
    */

  },
  methods:{
    getBaseTicker(){
      axios.get('https://poloniex.com/public?command=returnTicker').then((response) => {
        this.loading_step = 'Analizando datos';
        var coins_obj = {};
        for (let currencyPair in response.data) {
          let currencyArr = currencyPair.split('_');
          coins_obj[ currencyArr[1] ] = {
            coin: currencyArr[1]
          }
        }

        for (let currencyPair in response.data) {
          let currencyArr = currencyPair.split('_');
          if ( ['USDT', 'BTC'].indexOf(currencyArr[0]) < 0 ) {
            continue;
          }
          
          if (this.acceptable_coins.indexOf(currencyArr[1]) < 0) {
            continue;
          }

          let data = response.data[currencyPair];
          let key = 'usd_value';

          if (currencyArr[0] == 'USDT') {
            coins_obj[ currencyArr[1] ].usd_change = data.percentChange
            coins_obj[ currencyArr[1] ].usd_value = data.lowestAsk
          }else if (currencyArr[0] == 'BTC') {
            coins_obj[ currencyArr[1] ].btc_change = data.percentChange
            coins_obj[ currencyArr[1] ].btc_value = data.lowestAsk
          }else{
            throw 'que carajo?'
          }
          
        }

        if (this.acceptable_coins.indexOf('BTC') >= 0) {
          coins_obj.BTC.btc_change = 0;
          coins_obj.BTC.btc_value = 1;
        }

        this.coins = this.acceptable_coins.map( (coin) => coins_obj[coin]);
        this.loading = false;
      })
    },
    updateCurrency(data){
      let curr = this.coins.filter( (coin) => coin.coin == data.currencyTo)[0];

      if (data.currencyFrom == 'USDT') {
        curr.usd_change = data.percentChange
        curr.usd_value = data.lowestAsk
      }else if (data.currencyFrom == 'BTC') {
        curr.btc_change = data.percentChange
        curr.btc_value = data.lowestAsk
      }else{
        throw 'que carajo?'
      }
    },
  },
  data () {
    return {
      loading_step: 'Conectando...',
      coins: [],
      online: false,
      acceptable_coins: window._COINS || ['BTC', 'XMR', 'LTC', 'ETH'],
      btc_cost: 0.00,
      loading: true
    }
  }
}
</script>
<style>
  #crypto-ticker{
    width: 300px;
  }
</style>
<style scoped>
  @import '~bulma/css/bulma.css';

  .negative{
    color: #A11B0A;
  }
  .positive{
    color: #3d9400;
  }
</style>
