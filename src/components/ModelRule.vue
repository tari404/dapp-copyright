<template>
  <div>
    <h2>版权授权</h2>
    <!-- <input type="text" v-model="inputTarget">
    <div class="notice" v-if="!inputTarget">{{$t('Query.input')}}</div> -->
    <ul class="content">
      <li>设置价格</li>
      <li>
        <span class="key">按月</span>
        <input type="number" @keydown="filterInput($event)" v-model="permonth">
        <span>wei</span>
      </li>
      <li>
        <span class="key">永久</span>
        <input type="number" @keydown="filterInput($event)" v-model="permanent">
        <span>wei</span>
      </li>
    </ul>
    <p class="notice">版权授权后，您的版权将会在版权商城展示出售</p>
    <div class="button" :class="{
      'button-active': true
    }" @click="updateRule">{{state ? $t('processing') : $t('confirm')}}</div>
  </div>
</template>

<script>
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
      console.log('rule')
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
