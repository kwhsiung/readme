<template>
  <div class="header" :class="{ login: $store.getters.isLoginPage }">
    <div class="header__wrapper">
      <div class="left">
        <div class="logo">
          <router-link to="/"><img src="/public/icons/readme.png"></router-link>
        </div>
      </div>
      <div class="right">
        <AccountActionBox v-if="!$store.getters.isLoginPage"></AccountActionBox>
        <!--div class="logout" @click="logout" v-show="showLogout"><span v-text="$t('HEADER.LOGOUT')"></span></div-->
      </div>    
    </div>
  </div>
</template>
<script>
  import AccountActionBox from 'src/components/header/AccountActionBox.vue'
  const debug = require('debug')('CLIENT:ReadMeHeader')
  export default {
    name: 'ReadMeHeader',
    components: {
      AccountActionBox,
    },
    computed: {
      showLogout () {
        return !this.$route.path.match(/\/login([A-Za-z0-9.*+?^=!:${}()#%~&_@\-`|\[\]\/\\]*)?$/)
      },
    },
    data () {
      return {}
    },
    methods: {
      logout () {
        location.replace('/login')
      },
    },
    mounted () {
      debug(this.$route.path.match(/\/login([A-Za-z0-9.*+?^=!:${}()#%~&_@\-`|\[\]\/\\]*)?$/))
    },
  }
</script>
<style lang="stylus" scoped>
  .header
    height 60px
    width 100%
    background-color #fff
    &.login
      height 192px
      background-color rgba(229,229,229,0.3)
      .right
        display none
      .left
        flex 1
        display flex
        justify-content center
        align-items center
        .logo
          width 230px
          justify-content center
          align-items center
          img
            width 100%
    &__wrapper
      background-color rgba(229,229,229,0.3)
      display flex
      justify-content space-between
      padding 8px
      height 100%
      width 100%
      padding 17px 21px
    .left, .right
      > div
        // background-color #010101
        // box-shadow 0 0 5px rgba(125,125,125,0.6)
        color #d3d3d3
        padding 0 10px
        height 100%
        display flex
        justify-content center
        align-items center
        &:hover
          cursor pointer
      .logo
        align-items flex-start
        justify-content flex-start
        padding 0
        img
          width 119px
          object-fit contain
          object-position center

</style>