<template>
  <div>
    <h2>{{$t('Shop.title')}}</h2>
    <div
      class="cpr-content-notice"
      v-if="worksState === 1">
      {{$t('loading')}}
    </div>
    <div
      class="cpr-content-notice"
      v-else-if="worksState === 2 && works.length === 0">
      {{$t('Shop.nowork')}}
    </div>
    <ul v-else class="cpr-works-list">
      <li v-for="item in works" :key="item.id" @click="queryDetail(item.id)">
        <img :src="defaultImg">
        <p>{{item.name}}</p>
      </li>
    </ul>
    <div class="cpr-page-turn">
      <span :class="{ 'disable': page === 1 }" @click="turn(-1)">{{$t('Shop.prev')}}</span>
      <div>{{page}} / {{totalPage}}</div>
      <span :class="{ 'disable': page === totalPage }" @click="turn(1)">{{$t('Shop.next')}}</span>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'
import defaultImg from '@/assets/work.jpg'

export default {
  name: 'Shop',
  props: ['route'],
  data () {
    return {
      defaultImg,

      page: 1,
      size: 12,
      worksState: 0,
      works: []
    }
  },
  computed: {
    ...mapState({
      shopSize: state => state.web3.shopSize
    }),
    totalPage () {
      return Math.min(Math.ceil(this.shopSize / this.size), 1000) || 1
    }
  },
  watch: {
    route (value) {
      if (value === 'shop') {
        this.update()
      }
    }
  },
  created () {
    this.update()
    setTimeout(() => {
      this.worksState = this.worksState || 1
    }, 300)
  },
  methods: {
    ...mapActions({
      'shopPaged': 'web3/getShopPaged',
      'updateShopSize': 'web3/updateShopSize'
    }),
    update () {
      this.updateShopSize()
      this.shopPaged({
        page: this.page - 1,
        size: this.size
      }).then(res => {
        this.works = res
        this.worksState = 2
      })
    },
    turn (offset) {
      const page = this.page + offset
      if (page > 0 && page <= this.totalPage) {
        this.page = page
        this.update()
      }
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
.cpr-page-turn
  display flex
  align-items center
  justify-content center
  span
    margin 0 20px
    cursor pointer
  .disable
    cursor default
    color #999
</style>
