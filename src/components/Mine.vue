<template>
  <div>
    <h2>我的版权</h2>
    <div class="new-work">新加版权认证</div>
    <ul class="cpr-works-list">
      <li v-for="item in registeredWorks" :key="item.id">
        <img src="" alt="">
        <p>{{item.name}}</p>
      </li>
    </ul>
    <br class="cpr-blank">
    <h2>我购买的权限</h2>
  </div>
</template>

<script>
import { mapActions } from 'vuex'

export default {
  name: 'Mine',
  data () {
    return {
      registeredWorks: []
    }
  },
  created () {
    this.getRegisteredWorks().then(res => {
      this.registeredWorks = res
    })
  },
  methods: {
    ...mapActions({
      'getRegisteredWorks': 'web3/getRegisteredWorks'
    })
  }
}
</script>

<style lang="stylus" scoped>
h2
  margin 0 0 20px
  font-weight 500
  font-size 20px
  line-height 20px
.new-work
  position absolute
  top 30px
  right 30px
  width 150px
  height 40px
  box-sizing border-box
  border-radius 20px
  color #fff
  background-color #1E64B4
  opacity .8
  line-height 40px
  text-align center
  cursor pointer
  transition opacity .4s
  &:hover
    opacity 1

.cpr-works-list
  display grid
  grid-template-columns repeat(4, 1fr)
  grid-gap 40px
  margin 40px 0
  li
    cursor pointer
    height 196px
    border solid 1px #bfbfbf
    box-shadow 0 6px 20px rgba(0, 0, 0, 0.1)
    border-radius 10px
    padding 20px
    align-items center
    box-sizing border-box
    position relative
    img
      width 100%
      height 120px
      background-color #eee
      display block
    p
      font-size 18px
      line-height 20px
      margin 16px 0 0
      color #666
      text-align center

@media screen and (max-width: 1100px)
  .trace-cargoes
    grid-template-columns repeat(3, 1fr)
@media screen and (max-width: 900px)
  .trace-cargoes
    grid-template-columns repeat(2, 1fr)
@media screen and (max-width: 560px)
  .trace-cargoes
    grid-template-columns repeat(1, 1fr)
</style>
