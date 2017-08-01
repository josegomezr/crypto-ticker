<template>
  <div class="dropdown" :class="{'is-active': ui.coin_select_shown}">
    <div class="dropdown-trigger">
      <button class="button is-small" aria-haspopup="true" aria-controls="dropdown-menu" @click="ui.coin_select_shown=!ui.coin_select_shown">
        <span><i class="fa fa-bitcoin"></i></span>
        <span class="icon is-small">
          <i class="fa fa-angle-down" aria-hidden="true"></i>
        </span>
      </button>
    </div>
    <div class="dropdown-menu" id="dropdown-menu" role="menu">
      <div class="dropdown-content coin-dropdown-content">
        <a @click="select(item)" v-for="item in data" class="dropdown-item">
          <span><i class="fa fa-usd"></i></span>
        </a>
        <a href="#" class="dropdown-item">
          <span><i class="fa fa-btc"></i></span>
        </a>
      </div>
    </div>
  </div>
</template>
<script>
export default {
  name: 'combo-box',
  props: ['data', 'selected'],
  computed:{

  },
  data(){
    return {
      current: null,
      base_data: this.data
    }
  }
}
</script>