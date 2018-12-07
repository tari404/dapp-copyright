<template>
  <div>
    <h2>{{$t('Auth.takedown')}}</h2>
    <p class="notice">{{$t('Auth.notice')}}</p>
    <div class="button" :class="{
      'button-active': !state
    }" @click="takeDown">{{state ? $t('processing') : $t('confirm')}}</div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'ModelDown',
  props: ['work'],
  data () {
    return {
      state: false
    }
  },
  methods: {
    ...mapActions({
      'notice': 'notice',
      'pullOff': 'web3/pullOff'
    }),
    takeDown () {
      if (this.state) {
        return
      }
      this.state = true
      this.pullOff({
        id: this.work.id
      }).then(res => {
        this.state = false
        if (res.events) {
          this.$emit('needupdate')
          this.notice(['log', this.$t('Notice.work') + this.work.name + this.$t('Notice.tookdown'), 10000])
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
