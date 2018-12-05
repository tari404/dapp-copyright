<template>
  <div class="main-width">
    <div class="cpr-content">
      <h2>{{$t('Query.title')}}</h2>
      <div v-if="owner === address" class="cpr-button" @click="toggleModel('rule')">创建/更新授权规则</div>
      <div v-else-if="work && work.onSale" class="cpr-button" @click="toggleModel('buy')">购买授权</div>
      <div v-if="loaded === 1" class="cpr-content-notice">{{$t('loading')}}</div>
      <div v-else-if="notExist && loaded" class="cpr-content-notice">{{$t('Query.nocargoes')}}</div>
      <div v-else-if="work && loaded">
        <div class="cpr-work-name">
          <img :src="defaultImg">
          <span>{{work.name}}</span>
          <!-- <div>{{$t('Query.createtime')}}</div> -->
        </div>
        <div class="cpr-work-detail">
          <p>
            <span class="key">{{$t('Query.id')}}</span>
            <span class="hash">{{work.id}}</span>
          </p>
          <p>
            <span class="key">{{$t('Query.owner')}}</span>
            <span class="hash">{{owner}}</span>
          </p>
          <p>
            <span class="key">{{$t('Query.intro')}}</span>
            <span class="pre">{{work.intro}}</span>
          </p>
        </div>
        <hr>
        <div v-if="work.onSale" class="cpr-work-price">
          <p>允许购买授权</p>
          <div>
              <span class="key">授权模式</span>
              <span class="key">每月 (30天)</span>
              <span class="key">永久</span>
              <span>授权价格</span>
              <span>{{work.permonth}} wei</span>
              <span>{{work.permanent}} wei</span>
          </div>
        </div>
        <div v-else class="cpr-work-price">
          <p>作者暂时不允许购买其授权</p>
        </div>
      </div>
    </div>
    <div v-if="model === 'rule'" class="cpr-modal">
      <div class="main">
        <div class="close" @click="toggleModel(false)">
          <span/>
          <span/>
        </div>
        <model-rule @needupdate="update" :work="work" />
      </div>
    </div>
    <div v-if="work" class="cpr-content cpr-validity">
      <h2>我的权益</h2>
      <div v-if="owner === address">你是该作品的作者</div>
      <ul v-else>
        <li>
          <span class="key">是否购买授权</span>
          <span class="value">{{hasValidity ? '是' : '否'}}</span>
        </li>
        <li v-if="hasValidity">
          <span class="key">授权有效时间</span>
          <span class="value">{{permanent ? '永久' : validity}}</span>
          <span :class="{ 'valid': valid }">{{valid ? '生效中' : '已过期'}}</span>
        </li>
      </ul>
    </div>
    <div v-if="model === 'buy'" class="cpr-modal">
      <div class="main">
        <div class="close" @click="toggleModel(false)">
          <span/>
          <span/>
        </div>
        <model-buy @needupdate="update" :work="work" />
      </div>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import ModelBuy from './ModelBuy'
import ModelRule from './ModelRule'
import defaultImg from '@/assets/work.jpg'

const zeroAddress = '0x0000000000000000000000000000000000000000'

export default {
  name: 'Query',
  props: ['workID'],
  data () {
    return {
      defaultImg,
      work: null,

      permanent: false,
      hasValidity: false,
      validity: '',
      valid: false,

      loaded: 0,
      model: false
    }
  },
  watch: {
    workID (id) {
      this.work = null
      this.queryCargo(id)
    }
  },
  computed: {
    ...mapState({
      utils: state => state.web3.utils
    }),
    ...mapGetters({
      address: 'web3/address'
    }),
    owner () {
      if (this.work) {
        return this.work.owner
      } else {
        return zeroAddress
      }
    },
    notExist () {
      if (this.work) {
        return this.work.owner === zeroAddress
      } else {
        return false
      }
    }
  },
  created () {
    this.queryWork()
    setTimeout(() => {
      this.loaded = this.loaded || 1
    }, 300)
  },
  methods: {
    ...mapActions({
      notice: 'notice',
      getWork: 'web3/getWork',
      getValidity: 'web3/getValidity'
    }),
    update () {
      this.toggleModel(false)
      this.queryWork()
    },
    queryWork () {
      const id = this.workID
      if (!id || !/^0x[0-9A-Fa-f]{64}$/.test(id)) {
        return
      }
      if (this.work) {
        this.work.update()
      } else {
        this.getWork(id).then(res => {
          this.loaded = 2
          this.work = res
        })
      }
      this.getValidity({
        address: this.address,
        id
      }).then(res => {
        const timestamp = Number(res) * 1000
        if (timestamp > 1e14) {
          this.permanent = true
          this.hasValidity = true
          this.valid = true
        } else if (timestamp > 0) {
          this.validity = new Date(timestamp).toLocaleDateString().replace(/\//g, '-')
          this.hasValidity = true
          this.valid = timestamp > new Date().getTime()
        }
      })
    },
    toggleModel (state) {
      this.model = state
      document.body.style.overflow = state ? 'hidden' : ''
    }
  },
  components: {
    ModelBuy,
    ModelRule
  }
}
</script>

<style lang="stylus" scoped>
.main-width
  margin-bottom 100px
  color #333
h2
  margin 0
  font-weight 500
  font-size 20px
  line-height 20px
hr
  border-top dashed 1px #1864b8
  border-bottom none
.cpr-work-name
  margin 30px 0
  display flex
  align-items top
  color #666
  img
    width 220px
    height 100px
    object-fit cover
    object-position center top
  span
    margin 10px 20px
    font-size 18px
    flex 1
.cpr-work-detail
  p
    font-size 18px
    line-height 30px
    margin 18px 0
    display flex
  .key
    flex 0 0 140px
  .hash
    overflow hidden
    text-overflow ellipsis
  .pre
    white-space pre
.cpr-work-price
  div
    display grid
    grid-gap 2px 
    grid-template-columns 0.5fr 1fr 1fr
    border solid 1px #1b64b6
    border-radius 10px
    overflow hidden
    margin 10px 0
    line-height 30px
    span
      padding 8px
      text-align center
    .key
      background-color #1b64b6
      color #fff
  p
    font-size 18px
    line-height 18px
    margin 30px 0 20px
.cpr-validity
  font-size 18px
  line-height 30px
  div
    margin-top 24px
  ul
    margin-top 24px
  li
    margin-top 18px
    display flex
  .key
    flex 0 0 140px
  .value
    flex 1
  .valid
    color #1b64b6
</style>
