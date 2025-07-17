<template>
  <app-header
    v-if="$route.name !== 'ComicReader'"
    v-model:keyword="headerKeyword"
    @search="onHeaderSearch"
    @clear="onHeaderClear"
  />
  <router-view :header-keyword="headerKeyword" @update-header-keyword="headerKeyword = $event" />
</template>

<script>
import AppHeader from './components/AppHeader.vue';

export default {
  name: 'App',
  components: { AppHeader },
  data() {
    return {
      headerKeyword: ''
    }
  },
  methods: {
    onHeaderSearch(keyword) {
      // 跳转到搜索结果页并带上 keyword 查询参数
      if (keyword && keyword.trim()) {
        this.headerKeyword = keyword;
        this.$router.push({ name: 'SearchResult', query: { keyword } });
      } else {
        this.headerKeyword = '';
        this.$router.push({ name: 'SearchResult' });
      }
    },
    onHeaderClear() {
      this.$root.$emit('header-clear');
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
