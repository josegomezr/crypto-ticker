import Vue from 'vue'

const _bus = new Vue();

export let $bus = _bus;

export default {
  install(Vue){
    Vue.prototype.$event_bus = _bus
  }
}
