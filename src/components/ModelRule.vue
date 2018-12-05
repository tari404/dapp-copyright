<template>
  <div>
    <h2>{{$t('Shop.rule')}}</h2>
    <!-- <input type="text" v-model="inputTarget">
    <div class="notice" v-if="!inputTarget">{{$t('Query.input')}}</div> -->
    <ul class="content">
      <li>{{$t('Shop.setprice')}}</li>
      <li>
        <span class="key">{{$t('Shop.permonth')}}</span>
        <input type="number" @keydown="filterInput($event)" v-model="permonth">
        <span>wei</span>
      </li>
      <li>
        <span class="key">{{$t('permanent')}}</span>
        <input type="number" @keydown="filterInput($event)" v-model="permanent">
        <span>wei</span>
      </li>
    </ul>
    <p class="notice">{{$t('Shop.notice')}}</p>
    <div class="button" :class="{
      'button-active': Number(permonth) && Number(permanent) && !state
    }" @click="updateRule">{{state ? $t('processing') : $t('confirm')}}</div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'ModelRule',
  props: ['work'],
  data () {
    return {
      permonth: '0',
      permanent: '0',
      state: false
    }
  },
  created () {
    this.permonth = this.work.permonth.toString()
    this.permanent = this.work.permanent.toString()
  },
  methods: {
    ...mapActions({
      'notice': 'notice',
      'saleAuthorization': 'web3/saleAuthorization'
    }),
    filterInput (e) {
      const valid = !isNaN(Number(e.key))
        || e.key === 'Backspace'
        || e.key === 'Enter'
        || /Arrow/.test(e.key)
        && !(e.key === 'ArrowDown' && Number(this.month) <= 1)
      if (!valid) {
        e.preventDefault()
      }
    },
    updateRule () {
      const permonth = Number(this.permonth)
      const permanent = Number(this.permanent)
      if (!permonth || !permanent || this.state) {
        return
      }
      this.state = true
      this.saleAuthorization({
        id: this.work.id,
        permonth,
        permanent
      }).then(res => {
        this.state = false
        if (res.events) {
          this.$emit('needupdate')
          this.notice(['log', this.$t('Notice.work') + this.work.name + this.$t('Notice.onshelves'), 10000])
        } else if (/reverted by the EVM/.test(res.message)) {
          this.notice(['error', this.$t('Notice.unknow'), 10000])
        } else {
          this.notice(['error', this.$t('Notice.neterror'), 10000])
        }
      })
    }
  }
}
</script>

<style lang="stylus" scoped>
.content
  display flex
  line-height 60px
  margin 60px 0
  font-size 18px
  color #666
  justify-content center
  li
    display flex
  .key
    margin-left 30px
  input
    width 120px
    height 60px
    margin 0 6px
    font-size 18px
    padding 10px 14px
    border-radius 10px
    border solid 1px #d2d2d2
    color #666
.notice
  color #999
  text-align center
  margin 60px 0
</style>
