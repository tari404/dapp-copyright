<template>
  <div class="main-width">
    <div class="cpr-content cpr-account">
      <h2>{{$t('Account.current')}}</h2>
      <div>
        <img :src="user.img">
        <span class="name">{{$t(`Account.player[${user.index}]`)}}</span>
      </div>
      <p>
        <span class="key">{{$t('Account.address')}}</span>
        <span class="hash">{{address}}</span>
      </p>
    </div>
    <ul class="cpr-home-menu">
      <li :class="{ 'focus': route === 'mine' }" @click="toggleRoute('mine')">{{$t('mine')}}</li>
      <li :class="{ 'focus': route === 'shop' }" @click="toggleRoute('shop')">{{$t('shop')}}</li>
    </ul>
    <div class="cpr-content no-right-top-radius">
      <mine @queryDetails="queryDetails" :route="route" v-show="route === 'mine'" />
      <shop @queryDetails="queryDetails" :route="route" v-show="route === 'shop'" />
    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

import Mine from './Mine'
import Shop from './Shop'

export default {
  name: 'Cargoes',
  data () {
    return {
      route: 'mine'
    }
  },
  computed: {
    ...mapGetters({
      user: 'user',
      address: 'web3/address'
    })
  },
  methods: {
    toggleRoute (path) {
      this.route = path
    },
    queryDetails (id) {
      this.$emit('queryDetails', id)
    }
  },
  components: {
    Mine,
    Shop
  }
}
</script>

<style lang="stylus" scoped>
.main-width
  margin-bottom 100px
h2
  margin 0 0 20px
  font-weight 500
  font-size 20px
  line-height 20px

.cpr-account
  font-size 18px
  color #333
  div
    margin 30px 0
    display flex
    img
      width 40px
      height 40px
      border-radius 20px
      margin-right 20px
    span
      line-height 40px
    .name
      flex 1
  p
    margin 0
    display flex
    line-height 20px
    .key
      flex 0 0 140px
    .hash
      overflow hidden
      text-overflow ellipsis

.cpr-home-menu
  display flex
  li
    width 150px
    height 50px
    border-radius 10px 10px 0 0
    background-color #e5e5e5
    line-height 50px
    font-size 16px
    text-align center
    color #666
    cursor pointer
    transition color .4s, background-color .4s
  .focus
    background-color #fff
    color #1E64B4

.no-right-top-radius
  border-top-left-radius 0
</style>
