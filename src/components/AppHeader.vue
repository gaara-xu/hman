<template>
  <div class="home-header">
    <div class="header-menu-row">
      <span class="site-title">韩漫库</span>
      <span class="site-menu" :class="{active: isActive('update')}" @click="go('/')">更新</span>
      <span class="site-menu" :class="{active: isActive('category')}" @click="go('/tag')">分类</span>
      <span class="site-menu" :class="{active: isActive('favorite')}" @click="go('/collect')">收藏</span>
    </div>
    <div class="header-search-row">
      <van-search
        :model-value="keyword"
        @update:model-value="onInput"
        placeholder="请输入漫画名称或作者名"
        show-action
        action-text="搜索"
        @search="onSearch"
        @clear="onClear"
        class="home-search"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: 'AppHeader',
  props: {
    keyword: String
  },
  emits: ['update:keyword', 'search', 'clear'],
  methods: {
    onInput(val) {
      this.$emit('update:keyword', val);
      // 输入即搜
      this.$emit('search', val);
    },
    go(path) {
      if (this.$route.path !== path) this.$router.push(path)
    },
    isActive(type) {
      if (type === 'update') return this.$route.path === '/';
      if (type === 'category') return this.$route.path.startsWith('/tag');
      if (type === 'favorite') return this.$route.path.startsWith('/collect');
      return false;
    },
    onSearch() {
      // 传递当前 keyword 给父组件
      this.$emit('search', this.keyword);
    },
    onClear() {
      this.$emit('clear');
    }
  },
  // 移除对 props 的 watch，直接通过 v-on 传递
}
</script>

<style scoped>
.home-header {
  display: flex;
  flex-direction: column;
  padding: 16px 16px 0 16px;
  background: #fff;
}
.header-menu-row {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}
.header-search-row {
  width: 100%;
  margin-top: 8px;
}
.site-title {
  font-size: 22px;
  font-weight: bold;
  margin-right: 24px;
  color: #d32f2f;
}
.site-menu {
  margin-right: 18px;
  font-size: 16px;
  color: #333;
  cursor: pointer;
}
.site-menu.active {
  color: #ff5722;
  border-bottom: 2px solid #ff5722;
}
.home-search {
  flex: 1;
  margin-left: 24px;
  min-width: 220px;
  border-radius: 12px;
  background: #f8f8fa;
  box-shadow: 0 2px 8px rgba(0,0,0,0.06);
  border: 1px solid #eee;
  height: 44px;
  font-size: 16px;
  padding: 0 12px;
  transition: box-shadow .2s, border .2s;
}
.home-search:focus-within {
  box-shadow: 0 4px 16px rgba(255,87,34,0.10);
  border: 1.5px solid #ff5722;
}
@media (max-width: 600px) {
  .home-header {
    flex-direction: column;
    align-items: stretch;
    padding: 12px 8px 0 8px;
    width: 100vw;
  }
  .header-menu-row {
    flex-direction: row;
    align-items: center;
    flex-wrap: nowrap;
    width: 100vw;
    overflow-x: auto;
  }
  .site-title, .site-menu {
    white-space: nowrap;
  }
  .header-search-row {
    width: 100vw;
    margin-top: 8px;
    margin-left: 0;
  }
  .home-search {
    margin-left: 0;
    width: 100vw;
    min-width: 0;
    margin-top: 0;
    border-radius: 10px;
    height: 40px;
    font-size: 15px;
    padding: 0 8px;
  }
}
</style>
