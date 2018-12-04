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
    <div v-if="model" class="cpr-modal" @wheel.prevent>
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
              <input type="text">
            </li>
            <li>
              <span>介绍</span>
              <input type="text">
            </li>
          </ul>
          <div class="button" :class="{
            'button-active': true
          }" @click="submit">{{createState ? $t('processing') : $t('confirm')}}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapActions } from 'vuex'
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
    ...mapActions({
      'getRegisteredWorks': 'web3/getRegisteredWorks',
      'getBoughtWorks': 'web3/getBoughtWorks'
    }),
    update () {
      this.getRegisteredWorks().then(res => {
        this.registeredWorks = res
        this.rWorksState = 2
      })
      this.getBoughtWorks().then(res => {
        this.boughtWorks = res
        this.bWorksState = 2
      })
    },
    queryDetail (id) {
      this.$emit('queryDetails', id)
    },
    toggleModel (state) {
      this.model = state
    },
    submit () {
      console.log('submit')
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
      font-size 18px
      padding 10px 14px
      border-radius 10px
      border solid 1px #d2d2d2
      color #666
</style>
