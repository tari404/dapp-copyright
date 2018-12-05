<template>
  <div>
    <h2>{{$t('Query.buy')}}</h2>
    <div class="content select-time">
      <span class="key">{{$t('Query.time')}}</span>
      <ul>
        <li>
          <span class="radio" :class="{ 'radio-focus': isMonthly }" @click="toggleMode(true)"></span>
          <div class="number-input">
            <span @click="subOneMonth">-</span>
            <input type="number" @keydown="filterInput($event)" v-model="month">
            <span @click="addOneMonth">+</span>
          </div>
          <span>{{$t('month')}}</span>
        </li>
        <li>
          <span class="radio" :class="{ 'radio-focus': !isMonthly }" @click="toggleMode(false)"></span>
          <span>{{$t('permanent')}}</span>
        </li>
      </ul>
    </div>
    <div class="content">
      <span class="key">{{$t('price')}}</span>
      <span>{{price}} wei</span>
    </div>
    <div class="button" :class="{
      'button-active': (!isMonthly || Number(month)) && !buyState
    }" @click="buy">{{buyState ? $t('processing') : $t('confirm')}}</div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'ModelBuy',
  props: ['work'],
  data () {
    return {
      buyState: false,
      isMonthly: true,
      month: '1'
    }
  },
  computed: {
    price () {
      if (this.isMonthly) {
        return this.work.permonth * Number(this.month)
      } else {
        return this.work.permanent
      }
    }
  },
  methods: {
    ...mapActions({
      'notice': 'notice',
      'buyAuthorizationPerMonth': 'web3/buyAuthorizationPerMonth',
      'buyAuthorizationPermanent': 'web3/buyAuthorizationPermanent'
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
    toggleMode (isMonthly) {
      this.isMonthly = isMonthly
    },
    subOneMonth () {
      if (Number(this.month) > 1) {
        this.month = (Number(this.month) - 1).toString()
      }
    },
    addOneMonth () {
      this.month = (Number(this.month) + 1).toString()
    },
    buy () {
      if ((this.isMonthly && !Number(this.month)) || this.buyState) {
        return
      }
      this.buyState = true
      const buyPromise = this.isMonthly
        ? this.buyAuthorizationPerMonth({
          id: this.work.id,
          month: Number(this.month),
          permonth: this.work.permonth
        })
        : this.buyAuthorizationPermanent({
          id: this.work.id,
          permanent: this.work.permanent
        })
      buyPromise.then(res => {
        this.buyState = false
        if (res.events) {
          this.$emit('needupdate')
          this.notice(['log', this.$t('Notice.buy'), 10000])
        } else if (/reverted by the EVM/.test(res.message)) {
          this.notice(['error', this.$t('Notice.unknow'), 10000])
        } else if (/insufficient funds/.test(res.message)) {
          this.notice(['error', this.$t('Notice.insufficient'), 10000])
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
  height 40px
  line-height 42px
  margin 30px 0
  font-size 18px
  color #666
  .key
    flex 0 0 100px
.select-time
  ul
    display flex
  li
    display flex
    margin-right 40px
  .radio
    display block
    margin 11px 5px
    width 17px
    height 17px
    box-sizing border-box
    border-radius 50%
    border solid 2px #a0a0a0
    cursor pointer
  .radio-focus
    border solid 2px #0071bc
    position relative
    &:before
      content ''
      top 3px
      left 3px
      position absolute
      width 7px
      height 7px
      border-radius 50%
      background-color #0071bc
.number-input
  border solid 1px #d2d2d2
  border-radius 10px
  display flex
  margin 0 6px
  overflow hidden
  span
    width 40px
    line-height 38px
    text-align center
    box-sizing border-box
    cursor pointer
    user-select none
    &:first-child
      border-right solid 1px #d2d2d2
    &:last-child
      border-left solid 1px #d2d2d2
  input
    width 60px
    border none
    text-align center
</style>
