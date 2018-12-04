<template>
  <div>
    <h2>我的版权</h2>
    <div class="cpr-button">新加版权认证</div>
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
      boughtWorks: []
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
</style>
