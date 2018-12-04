<template>
  <div id="app">
    <nav>
      <div class="main-width">
        <h1>{{$t('title')}}</h1>
        <div class="cpr-i18n">
          <span :class="{ 'focus': $i18n.locale === 'sc' }"
            @click="toggleLang('sc')">简体中文</span>
          <span :class="{ 'focus': $i18n.locale === 'en' }"
            @click="toggleLang('en')">English</span>
        </div>
        <div v-if="route === 'query'" class="cpr-back" @click="goback">{{$t('goback')}}</div>
      </div>
    </nav>
    <section v-if="beforeEnter">
      <div class="cpr-intro cpr-content main-width">
        <p>
          {{$t('intro')}}
          <br>
          {{$t('introduction[0]')}}
        </p>
        <p>
          {{$t('introduction[1]')}}
        </p>
        <div class="cpr-intro-start" @click="start">{{$t('start')}}</div>
      </div>
    </section>
    <section v-else-if="beforeLogin">
      <div class="cpr-login cpr-content main-width">
        <h2>{{$t('login')}}</h2>
        <p>{{$t('Account.select')}}</p>
        <div class="cpr-login-select" :class="{
          'cpr-login-select-open': showOptions
        }" @click="clickSelector">
          <ul class="cpr-login-options" :style="{
            'transform': `translateY(${-selected * 80}px)`
          }">
            <li v-for="(user, index) in defaultUsers" :key="index"
              @click="selectOption($event, index)">
              <img :src="user.img">
              <span>{{$t(`Account.player[${user.index}]`)}}</span>
            </li>
          </ul>
        </div>
        <div class="cpr-login-start" @click="login">{{$t('login')}}</div>
      </div>
    </section>
    <section v-else-if="!beforeRefresh">
      <home v-if="route === 'info'" @queryDetails="showDetails" />
      <query v-if="route === 'query'" :workID='focusWorkID' />
    </section>
    <notice />
  </div>
</template>

<script>
import { mapState, mapGetters, mapActions } from 'vuex'
import Notice from '@/components/Notice'
import Home from '@/components/Home'
import Query from '@/components/Query'

export default {
  name: 'App',
  data () {
    return {
      beforeEnter: true,
      beforeLogin: true,
      beforeRefresh: false,
      userIndex: 0,

      showOptions: false,
      selected: 0,

      route: 'info',
      focusWorkID: 0
    }
  },
  computed: {
    ...mapState({
      defaultUsers: state => state.defaultUsers
    })
  },
  created () {
    this.checkNetwork()
  },
  methods: {
    ...mapActions({
      checkNetwork: 'web3/checkNetwork',
      updateUser: 'web3/updateUser'
    }),
    toggleLang (locale) {
      this.$i18n.locale = locale
      document.title = this.$t('title')
    },
    goback () {
      this.route = 'info'
    },
    start () {
      this.beforeEnter = false
    },
    login () {
      this.updateUser(this.selected)
      this.beforeLogin = false
    },
    clickSelector (event) {
      if (!this.showOptions) {
        this.showOptions = true
        event.stopPropagation()
        document.addEventListener('click', this.closeSelector)
      }
    },
    closeSelector () {
      this.showOptions = false
      document.removeEventListener('click', this.closeSelector)
    },
    selectOption (event, index) {
      if (!this.showOptions) {
        return
      }
      this.selected = index
    },
    toggleRoute (index) {
      this.route = index
    },
    showDetails (id) {
      this.route = 'query'
      this.focusWorkID = id
    }
  },
  components: {
    Notice,
    Home,
    Query
  }
}
</script>

<style lang="stylus">
@import 'assets/style.styl'

nav
  height 90px
  padding 0 15px
  display flex
  margin-bottom 60px
  background-color #fff
  box-shadow 0 2px 4px #0001
  h1
    color #333
    font-size 20px
    font-weight 600
    line-height 40px
    text-align center
  .main-width
    position relative
.cpr-i18n
  position absolute
  top 50%
  right 0
  transform translateY(-50%)
  padding 0 4px
  font-size 14px
  display flex
  span
    display block
    line-height 30px
    height 30px
    border solid 1px #bfbfbf
    box-sizing border-box
    color #666
    cursor pointer
  span:first-child
    border-right none
    padding 0 4px 0 8px
    border-radius 15px 0 0 15px
  span:last-child
    border-left none
    padding 0 8px 0 4px
    border-radius 0 15px 15px 0
  .focus
    background-color #1e64b4
    color #fff
    border-color #1e64b4
.cpr-back
  position absolute
  top 50%
  left 0
  transform translateY(-50%)
  color #333
  cursor pointer
  transition color .3s
  &:hover
    color #1e64b4

.cpr-menu
  float left
  border-radius 5px
  overflow hidden
  display flex
  box-shadow 0 2px 4px #0001
  li
    width 110px
    height 60px
    line-height 60px
    text-align center
    background-color #fff
    margin-right 1px
  .focus
    background-color #0d85da
    color #fff

.cpr-intro
  padding 20px 100px
  p
    font-size 18px
    line-height 30px
    color #666
  .cpr-intro-start
    width 300px
    height 60px
    background #1E64B4
    border-radius 10px
    line-height 60px
    text-align center
    color #fff
    font-size 18px
    cursor pointer
    margin 100px auto 80px

.cpr-login
  flex 0 1 800px
  margin auto
  padding 20px 150px
  h2
    margin 60px auto
    font-weight 400
    text-align center
    font-size 24px
    line-height 30px
    color #333
  p
    margin 20px 0
    font-size 18px
    line-height 20px
    color #666
  .cpr-login-start
    width 300px
    height 60px
    background #1E64B4
    border-radius 10px
    line-height 60px
    text-align center
    color #fff
    font-size 18px
    cursor pointer
    margin 60px auto 80px

.cpr-login-select
  cursor pointer
  height 80px
  border solid 1px #d2d2d2
  border-radius 10px
  overflow hidden
  position relative
  &:after
    content ''
    position absolute
    right 24px
    top 35px
    width 0
    height 0
    border-top solid 13px #bfbfbf
    border-left solid 10px transparent
    border-right solid 10px transparent
    transition transform .4s, opacity .4s
.cpr-login-select-open
  overflow visible
  li:nth-child(even)
    background-color #f9f9f9
  &:after
    transform scaleY(0)
    opacity 0
.cpr-login-options
  border solid 1px #d2d2d2
  border-radius 10px
  overflow hidden
  position absolute
  left -1px
  top -1px
  width 100%
  transition transform .4s
  li
    height 80px
    line-height 80px
    display flex
    background-color #fff
  img
    width 40px
    height 40px
    border-radius 20px
    margin 20px 24px
  span
    font-size 18px
    color #333
</style>
