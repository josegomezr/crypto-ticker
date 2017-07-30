import Vue from 'vue'
import BTCCalculator from './BTCCalculator.vue'
import $bus from './event-bus'

window.BTCCalculator = {
  init(config){
    config = config || {
      entry: '#app',
      fee: 0.00
    };

    let $vm = new Vue({
      el: config.entry,
      extra: config,
      render: h => h(BTCCalculator),
    });
    return $vm;
  }
}


