<template>
  <div>
    <h2>我的版权</h2>
    <div class="cpr-button" @click="toggleModel(true)">新加版权认证</div>
    <div
      class="cpr-content-notice"
      v-if="rWorksState === 1">
      加载中...
    </div>
    <div
      class="cpr-content-notice"
      v-else-if="rWorksState === 2 && registeredWorks.length === 0">
      没有版权登记记录
    </div>
    <ul v-else class="cpr-works-list">
      <li v-for="item in registeredWorks" :key="item.id" @click="queryDetail(item.id)">
        <img :src="defaultImg">
        <p>{{item.name}}</p>
      </li>
    </ul>
    <br class="cpr-blank">
    <h2>我购买的权限</h2>
    <div
      class="cpr-content-notice"
      v-if="bWorksState === 1">
      加载中...
    </div>
    <div
      class="cpr-content-notice"
      v-else-if="bWorksState === 2 && boughtWorks.length === 0">
      没有购买记录
    </div>
    <ul v-else class="cpr-works-list">
      <li v-for="item in boughtWorks" :key="item.id" @click="queryDetail(item.id)">
        <img :src="defaultImg">
        <p>{{item.name}}</p>
      </li>
    </ul>
    <div v-if="model" class="cpr-modal">
      <div class="main">
        <div class="close" @click="toggleModel(false)">
          <span/>
          <span/>
        </div>
        <div>
          <h2>新加版权认证</h2>
          <ul class="model-content">
            <li>
              <span>名称</span>
              <input type="text" v-model="inputName">
            </li>
            <li>
              <span>介绍</span>
              <textarea v-model="inputIntro" />
            </li>
          </ul>
          <div class="button" :class="{
            'button-active': inputName && inputIntro && !createState
          }" @click="submit">{{createState ? $t('processing') : $t('confirm')}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions, mapMutations } from 'vuex'
import defaultImg from '@/assets/work.jpg'

export default {
  name: 'Mine',
  props: ['route'],
  data () {
    return {
      defaultImg,

      rWorksState: 0,
      bWorksState: 0,
      registeredWorks: [],
      boughtWorks: [],

      model: false,
      inputName: '',
      inputIntro: '',
      createState: false
    }
  },
  watch: {
    route (value) {
      if (value === 'mine') {
        this.update()
      }
    }
  },
  created () {
    this.update()
    setTimeout(() => {
      this.rWorksState = this.rWorksState || 1
      this.bWorksState = this.rWorksState || 1
    }, 300)
  },
  methods: {
    ...mapMutations({
      'setPageLock': 'setPageLock'
    }),
    ...mapActions({
      'notice': 'notice',
      'getRegisteredWorks': 'web3/getRegisteredWorks',
      'getBoughtWorks': 'web3/getBoughtWorks',
      'registerWork': 'web3/registerWork'
    }),
    update (onlyUpdateRegistered) {
      this.getRegisteredWorks().then(res => {
        this.registeredWorks = res
        this.rWorksState = 2
      })
      if (!onlyUpdateRegistered) {
        this.getBoughtWorks().then(res => {
          this.boughtWorks = res
          this.bWorksState = 2
        })
      }
    },
    queryDetail (id) {
      this.$emit('queryDetails', id)
    },
    toggleModel (state) {
      this.model = state
      document.body.style.overflow = state ? 'hidden' : ''
    },
    submit () {
      if (!this.inputName || !this.inputIntro) {
        return
      }
      this.createState = true
      const name = this.inputName
      this.registerWork({
        name,
        intro: this.inputIntro
      }).then(res => {
        this.createState = false
        if (res.events) {
          this.update(true)
          this.inputName = ''
          this.inputIntro = ''
          this.toggleModel(false)
          this.notice(['log', this.$t('Notice.work') + name + this.$t('Notice.registered'), 10000])
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
h2
  margin 0
  font-weight 500
  font-size 20px
  line-height 20px
.model-content
  margin 60px 0
  line-height 60px
  font-size 18px
  color #999
  li
    display flex
    margin 30px 0
    justify-content center
    align-items center
    span
      flex 0 0 100px
  input
    width 400px
    height 60px
    padding 9px 14px
    border-radius 10px
    border solid 1px #d2d2d2
    color #666
  textarea
    width 400px
    height 60px
    line-height 30px
    min-height 60px
    max-height 240px
    padding 14px
    border-radius 10px
    border solid 1px #d2d2d2
    color #666
    resize vertical
</style>
