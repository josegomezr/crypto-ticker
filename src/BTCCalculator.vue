  <template>
  <div id="btc-calculator">
    <div v-if="loading">
      <p>&nbsp;</p>
      <p align="center">
        <span class="button is-grey is-small is-loading"></span> {{ loading_step }}
      </p>
    </div>
    <div v-else>
      <div class="form-group">
        <div class="input-group">
          <div class="input-group-btn">
            <span class="btn btn-primary">
              <i class="fa fa-bitcoin"></i>
            </span>
          </div>
          <input type="text" @click="$event.target.select()" class="form-control" @input="to_pen" @change="to_pen" v-model="model.btc" />
        </div>
      </div>

      <div v-if="model.btc > 0">
        <p class="text-center">Debe depositar</p>
        <div class="row clearfix">
          <div class="col-xs-12 col-sm-6">
            <div class="form-group">
              <div class="input-group">
                <span class="input-group-btn">
                  <span class="btn btn-success">
                    <i class="fa fa-usd"></i>
                  </span>
                </span>
                <strong class="form-control" disabled>{{ total_usd | numbro(2) }}</strong>
              </div>
            </div>
          </div>
          <div class="col-xs-12 col-sm-6">
            <div class="form-group">
              <div class="input-group">
                <span class="input-group-btn">
                  <span class="btn btn-info">
                    S/.
                  </span>
                </span>
                <strong class="form-control" disabled>{{ model.pen }}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>
      <br>
      <div class="form-group">
        <div class="input-group">
          <span class="input-group-btn">
            <span class="btn btn-primary">
              <i class="fa fa-bitcoin"></i>
            </span>
          </span>
          <strong class="input-group-addon">1</strong>
          <span class="input-group-addon">=</span>
          <span class="input-group-btn">
            <span class="btn btn-success">
              <i class="fa fa-usd"></i>
            </span>
          </span>

          <strong class="form-control">{{ one_btc_usd | numbro(2) }}</strong>
          <span class="input-group-addon">=</span>
          <span class="input-group-btn">
            <span class="btn btn-info">
              S/.
            </span>
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
      loading: true
    }
  }
}
</script>
<style scoped>
  /*@import '~bootstrap/dist/css/bootstrap.min.css';*/
  /*@import '~font-awesome/css/font-awesome.min.css';*/
  

  .form-group .input-group-btn .btn{
    border-radius: 0;
  }

  .form-group .form-control{
    border-right: 0;
  }
  
  .form-group .form-control:last-child{
    border-right: 1px solid rgb(204, 204, 204);
  }
  .form-group .form-control{
    border-left: 0;
  }
  
  .form-group .form-control:last-child{
    border-left: 1px solid rgb(204, 204, 204);
  }

  .form-group .input-group-addon+.input-group-addon{
    border-left: 0;
  }

  .form-group .input-group-btn:first-child .btn{
    border-top-left-radius: 4px;
    border-bottom-left-radius: 4px;
  }
  .form-group .input-group-btn:last-child .btn{
    border-top-right-radius: 4px;
    border-bottom-right-radius: 4px;
  }
  .form-group .form-control:last-child{
    margin-left: -1px;
  }
  .is-coin-addon{
    width: 50px;
  }

  .coin-total{
    min-width: 90px;
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

  .button{
    margin: 0 !important;
  }
</style>
