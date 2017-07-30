<template>
  <div id="crypto-ticker">
    <div v-if="loading">
      <p>&nbsp;</p>
      <p align="center">
        <span class="button is-grey is-small is-loading"></span> {{ loading_step }}
      </p>
    </div>
    <div v-else>
      <table class="table">
        <thead>
          <tr>
            <th colspan="2">Moneda</th>
            <th>BTC</th>
            <!-- 
            -->
            <th>USD</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="coin in coins" :key="coin.coin" class="diff-rows" :class="{ 'diff-up': coin.btc_diff > 0 || coin.usd_diff > 0, 'diff-down': coin.btc_diff < 0 || coin.usd_diff < 0 }">
            <td>
              <i :class="'cc '+coin.coin"></i>
            </td>
            <td>{{ coin.coin }}</td>
            <td>{{ coin.btc_value | numbro(8) }} 
              <span v-if="coin.coin != 'BTC'" :class="{'positive': coin.btc_change > 0, 'negative': coin.btc_change < 0, 'stalled': coin.btc_change == 0}">({{coin.btc_change | numbro(2) }}%)</span>
            </td>
            <!--
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
  name: 'crypto-ticker',
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

  },
  methods:{
    getBaseTicker(){
      axios.get('https://poloniex.com/public?command=returnTicker').then((response) => {
        this.loading_step = 'Analizando datos';
        var coins_obj = {};
        for (let currencyPair in response.data) {
          let currencyArr = currencyPair.split('_');
          coins_obj[ currencyArr[1] ] = {
            usd_diff: 0,
            btc_diff: 0,
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
            console.warn("Error Extraño *expedientes secretos X* (prefetch)");
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
      if (!curr) {
        return;  
      }
      let idx = this.coins.indexOf(curr);
      if (data.currencyFrom == 'USDT') {
        curr.usd_diff = data.lowestAsk-curr.usd_value
        if (curr.usd_diff > 0) {
          curr.usd_diff = 1;
        }else if (curr.usd_diff < 0){
          curr.usd_diff = -1
        }

        curr.usd_change = data.percentChange
        curr.usd_value = data.lowestAsk * (1+(this.fee/100))
      }else if (data.currencyFrom == 'BTC') {
        curr.btc_diff = data.lowestAsk-curr.btc_value
        if (curr.btc_diff > 0) {
          curr.btc_diff = 1;
        }else if (curr.btc_diff < 0){
          curr.btc_diff = -1
        }
        
        curr.btc_change = data.percentChange
        curr.btc_value = data.lowestAsk * (1+(this.fee/100))
      }else{
        console.warn("Error Extraño *expedientes secretos X* (live-reload)");
        throw 'que carajo?'
      }

      setTimeout(() => {
        curr.usd_diff = 0;
        curr.btc_diff = 0;
      }, 500)
    },
  },
  data () {
    let defaults = Object.assign({}, this.$root.$options.extra)
    return {
      loading_step: 'Conectando...',
      coins: [],
      online: false,
      acceptable_coins: defaults.coins,
      fee: defaults.fee,
      loading: true
    }
  }
}
</script>
<style scoped>
  @import '~bulma/css/bulma.css';
    
  .diff-rows{
    transition: all .3s ease;
  }

  .diff-up{
    background: rgba(127,255,127,.5);
  }
  .diff-down{
    background: rgba(255,127,127,.5);
  }
  
  .negative{
    color: #A11B0A;
  }
  .positive{
    color: #3d9400;
  }
</style>
