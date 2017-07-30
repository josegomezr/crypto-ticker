<template>
  <div id="btc-calculator">
    <div v-if="loading">
      <p>&nbsp;</p>
      <p align="center">
        <span class="button is-grey is-small is-loading"></span> {{ loading_step }}
      </p>
    </div>
    <div v-else>
      <p class="has-text-centered">
      <strong>
        Indique la cantidad de BTC que desea vender
      </strong>
      </p>
      <div class="field is-grouped is-grouped-centered">
        <div class="control">
          <div class="field has-addons">
            <div class="control">
              <span class="button has-icon is-info">
                <i class="fa fa-bitcoin"></i>
              </span>
            </div>
            <div class="control">
              <input type="text" @click="$event.target.select()" class="input" @input="to_pen" @change="to_pen" v-model="model.btc" />
            </div>
          </div>
        </div>
      </div>
      <div v-if="model.btc > 0">
        <p class="has-text-centered">Debe depositar</p>
        <div class="field is-grouped is-grouped-centered">
          <div class="control">
            <div class="field has-addons">
              <div class="control">
                <span class="button has-icon is-success is-coin-addon">
                  <i class="fa fa-usd"></i>
                </span>
              </div>
              <div class="control">
                <strong class="input coin-total">{{ total_usd | numbro(2) }}</strong>
              </div>
            </div>
          </div>
          <div class="control">
            <div class="field has-addons">
              <div class="control">
                <span class="button has-icon is-primary is-coin-addon">
                  S/.
                </span>
              </div>
              <div class="control">
                <strong class="input coin-total">{{ model.pen }}</strong>
              </div>
            </div>
          </div>
          
        </div>
      </div>
      <br>
      <div class="field is-grouped is-grouped-centered tarifario">
        <div class="control">
          <div class="field has-addons">
            <p class="tarifario-part control">
              <strong disabled class="tarifario-segment input">1</strong>
            </p>
            <p class="tarifario-part control">
              <span class="button tarifario-segment has-icon is-info">
                <i class="fa fa-bitcoin"></i>
              </span>
            </p>
            <p class="tarifario-part control">
              <span class="button tarifario-segment has-icon">
                =
              </span>
            </p>
            <p class="tarifario-part control">
              <span class="button tarifario-segment has-icon is-success">
                $
              </span>
            </p>
            <p class="tarifario-part control">
              <strong class="input tarifario-segment" disabled>
                {{ one_btc_usd | numbro(2) }}
              </strong>
            </p>
            <p class="tarifario-part control">
              <span class="button tarifario-segment has-icon">
                =
              </span>
            </p>
            <p class="tarifario-part control">
              <span class="button tarifario-segment has-icon is-primary">
                S/.
              </span>
            </p>
            <p class="tarifario-part control">
              <strong class="input tarifario-segment" disabled>
                {{ one_btc_pen | numbro(2) }}
              </strong>
            </p>
          </div>
        </div>
      </div>
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
    width:450px;
  }
</style>
<style scoped>
  @import '~bulma/css/bulma.css';
  @import '~font-awesome/css/font-awesome.min.css';

  .is-coin-addon{
    width: 50px;
  }

  .coin-total{
    width: 90px;
  }
  .tarifario .tarifario-segment{
    border-top: 1px solid #b5b5b5;
    border-bottom: 1px solid #b5b5b5;
  }

  .tarifario .tarifario-part:first-child .tarifario-segment{
    border-left: 1px solid #b5b5b5;
  }
  .tarifario .tarifario-part:last-child .tarifario-segment{
    border-right: 1px solid #b5b5b5;
  }
  .tarifario [disabled]{
    background: inherit;
  }
</style>
