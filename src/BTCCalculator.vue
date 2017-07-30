<template>
  <div id="btc-calculator">
    <div v-if="loading">
      <p>&nbsp;</p>
      <p align="center">
        <span class="button is-grey is-small is-loading"></span> {{ loading_step }}
      </p>
    </div>
    <div v-else>
      <div class="field">
        <label for="BTC" class="label">Indique la cantidad de BTC que desea vender</label>
        <input type="text" class="input" @input="to_pen" @change="to_pen" v-model="model.btc" />
      </div>
      <p v-if="model.btc > 0">Debe depositar S/. {{ model.pen }} ó $ {{ total_usd | numbro(2) }}</p>
      <p v-else>&nbsp;</p>
      Puede comprar 1 BTC por S/. {{ one_btc_pen | numbro(2) }} ó ${{ one_btc_usd | numbro(2) }}
    </div>
  </div>
</template>

<script>
import axios from 'axios';
import numbro from 'numbro';
import {$bus} from './event-bus'

export default {
  name: 'btc-calculator',
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
    this.loading = false;
    return;
    this.getBaseTicker();

    $bus.$on('bitfinex-open', () => {
      this.online = true;
    })
    $bus.$on('bitfinex-close', () => {
      this.online = false;
    })

    $bus.$on('bitfinex-ticker-USDT', (data) => {
    })
    $bus.$on('bitfinex-ticker-BTC', (data) => {
    })
  },
  computed:{
    btc_with_fee(){
      return this.btc_price * (1+(this.fee/100));
    },
    total_usd(){
      return this.model.btc * this.btc_with_fee;
    },
    one_btc_usd(){
      return 1 * this.btc_with_fee;
    },
    one_btc_pen(){
      return this.one_btc_usd * this.usd_pen;
    },
  },
  methods:{
    to_pen(){
      let total = this.btc_with_fee * this.model.btc * this.usd_pen;
      this.model.pen = numbro(total).format(',0.00');
    },
    to_btc(){
      let total = (this.model.pen / this.usd_pen) / this.btc_with_fee;
      this.model.btc = numbro(total).format(',0.00000000');
    },
    getBaseTicker(){
      axios.get('http://api.bitven.com/prices').then((response) => {
        this.loading_step = 'Analizando datos';
        this.btc_price = numbro(response.data.BTC_TO_USD_RATE).value()
        this.loading = false;
      })
    },
    updateCurrency(data){
    },
  },
  data () {
    let defaults = Object.assign({}, this.$root.$options.extra)
    return {
      model: {
        btc: 0,
        pen: 0
      },
      loading_step: 'Conectando...',
      btc_price: 2534.56,
      usd_pen: 3.22,
      online: false,
      fee: 10, //defaults.fee,
      loading: true
    }
  }
}
</script>
<style>
  #btc-calculator{
    width:300px;
  }
</style>
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
