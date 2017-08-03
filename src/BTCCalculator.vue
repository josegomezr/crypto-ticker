  <template>
  <div id="btc-calculator">
    <div v-if="loading">
      <p>&nbsp;</p>
      <p align="center">
        <span class="button is-grey is-small is-loading"></span> {{ loading_step }}
      </p>
    </div>
    <div v-else>
      <p v-if="message_header">{{ message_header }}</p>
      <div class="form-group">
        <div class="input-group">
          <div class="input-group-addon addon-btc">
            <i class="tarifario-icon fa fa-bitcoin"></i>
          </div>
          <input type="text" @click="$event.target.select()" class="form-control" @input="to_pen" @change="to_pen" v-model="model.btc" />
        </div>
      </div>

      <div>
        <p v-if="message_result">{{ message_result }}</p>
        <div class="row clearfix">
          <div class="col-xs-12 col-sm-6">
            <div class="form-group">
              <div class="input-group">
                <span class="input-group-addon addon-usd">
                  <i class="tarifario-icon fa fa-usd"></i>
                </span>
                <strong class="form-control">{{ total_usd | numbro(2) }}</strong>
              </div>
            </div>
          </div>
          <div class="col-xs-12 col-sm-6">
            <div class="form-group">
              <div class="input-group">
                <span class="input-group-addon addon-pen">
                  S/.
                </span>
                <strong class="form-control">{{ model.pen }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
      <br>
      <div class="form-group tarifario" v-if="!hide_tarifario">
        <div class="input-group">
          <span class="input-group-addon addon-btc">
            <i class="tarifario-icon fa fa-bitcoin"></i>
          </span>
          <strong class="form-control">1</strong>
          <span class="input-group-addon">=</span>
          <span class="input-group-addon addon-usd">
            <i class="tarifario-icon fa fa-usd"></i>
          </span>

          <strong class="form-control">{{ one_btc_usd | numbro(2) }}</strong>
          <span class="input-group-addon">=</span>
          <span class="input-group-addon addon-pen">
            S/.
          </span>
          <strong class="form-control">{{ one_btc_pen | numbro(2) }}</strong>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import $ from 'jquery';
import numbro from 'numbro';

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

    this.getBaseTicker();
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
      $.getJSON('http://api.bitven.com/prices').success((data) => {
        this.loading_step = 'Analizando datos';
        this.btc_price = numbro(data.BTC_TO_USD_RATE).value()
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
      fee: defaults.fee,
      message_header: defaults.message_header,
      message_result: defaults.message_result,
      hide_tarifario: defaults.hide_tarifario,
      operation: defaults.operation,
      loading: true
    }
  }
}
</script>
<style scoped>  
  
  .tarifario .input-group-btn .btn{
    border-radius: 0;
  }

  .tarifario .form-control{
    border-right: 0;
  }
  
  .tarifario .form-control:last-child{
    border-right: 1px solid rgb(204, 204, 204);
  }
  .tarifario .form-control{
    border-left: 0;
  }
  
  .tarifario .form-control:last-child{
    border-left: 1px solid rgb(204, 204, 204);
  }

  .tarifario .input-group-addon+.input-group-addon{
    border-left: 0;
  }

  .tarifario .input-group-btn:first-child .btn{
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  .tarifario .input-group-btn:last-child .btn{
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }

  .tarifario .form-control:last-child{
    margin-left: -1px;
  }

  .tarifario-icon{
    font-size: 19px;
  }

  .addon-usd{
    color: #fff;
    background-color: #5cb85c;
    border-color: #4cae4c;
  }

  .addon-btc{
    color: #fff;
    background-color: #337ab7;
    border-color: #2e6da4;
  }

  .addon-pen{
    color: #fff;
    background-color: #31b0d5;
    border-color: #269abc;
  }
  
  .button{
    margin: 0 !important;
  }

  @media (max-width: 768px){
    .tarifario .input-group-addon,
    .tarifario .form-control{
      padding: 6px; 
    }
  }
</style>
