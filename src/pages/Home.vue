<template>
  <div class="home">
    <div class="update-info">
      <span>今天更新了 <span class="update-count">{{ comics.length }}</span> 本漫画，持续更新中...</span>
    </div>
    <div class="comic-list-grid">
      <div v-for="comic in comics" :key="comic.id" class="comic-card">
        <img class="comic-img" :src="comic.var2 ? comic.var2 : comic.hmanlogo" :alt="comic.hmanname" @click="goDetail(comic.id)" />
        <div class="comic-title" @click="goDetail(comic.id)">{{ comic.hmanname }}</div>
        <div class="comic-update">
          <template v-if="comic.hmanover">
            <span class="status-finished">已完结</span>
          </template>
          <template v-else>
            更新：<span class="update-ep">{{ comic.hmanupdate }}</span>
          </template>
        </div>
        <div v-if="comic.hmanupdate && comic.macpath" class="comic-read-btn">
          <van-button type="primary" size="small" @click.stop="goRead(comic)">
            {{ comic.hmanupdate }}
          </van-button>
        </div>
      </div>
    </div>
    <div v-if="!comics.length" class="no-data">暂无漫画数据</div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'HomePage',
  props: ['headerKeyword'],
  data() {
    return {
      comics: []
    }
  },
  watch: {
    headerKeyword: {
      immediate: true,
      handler() {
        this.fetchDailyUpdate();
      }
    }
  },
  // Vue3不再使用事件总线，相关代码已移除
  methods: {
    goRead(comic) {
      // comic.macpath 可能为 https://se8.us/index.php/chapter/888900345，需提取最后的数字id
      let id = '';
      if (comic.macpath) {
        const match = comic.macpath.match(/(\d+)$/);
        if (match) id = match[1];
      }
      if (id) {
        this.$router.push({ name: 'ComicReader', params: { id } });
      }
    },
    async fetchDailyUpdate() {
      if (this.headerKeyword) return;
      try {
        const res = await axios.get('http://192.168.3.110/vuehman/getDailyUpdate');
        // 兼容数组或对象
        this.comics = Array.isArray(res.data) ? res.data : (res.data.list || []);
      } catch (e) {
        this.$toast && this.$toast.fail('获取更新失败');
      }
    },
    async onSearch() {
      if (!this.headerKeyword) return;
      try {
        const res = await axios.get(`http://192.168.3.110/vuehman/searchAllByHmanname/${encodeURIComponent(this.headerKeyword)}`);
        this.comics = Array.isArray(res.data) ? res.data : (res.data.list || []);
      } catch (e) {
        this.$toast && this.$toast.fail('搜索失败');
      }
    },
    onClear() {
      this.fetchDailyUpdate();
    },
    goDetail(id) {
      this.$router.push({ name: 'ComicDetail', params: { id } });
    }
  }
}
</script>

<style scoped>
.home {
  background: #fff;
  min-height: 100vh;
}
.home-header {
  display: flex;
  align-items: center;
  padding: 16px 16px 0 16px;
  background: #fff;
  flex-wrap: wrap;
}
.logo {
  width: 40px;
  height: 40px;
  margin-right: 8px;
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
}
.update-info {
  padding: 12px 16px 0 16px;
  font-size: 16px;
  color: #d32f2f;
}
.update-count {
  font-weight: bold;
  color: #ff5722;
}
.comic-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
  gap: 24px 16px;
  padding: 24px 16px 0 16px;
}
.comic-card {
  background: #fafafa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 12px 8px 8px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: box-shadow .2s;
}
.comic-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
}
.comic-img {
  width: 100px;
  height: 140px;
  object-fit: cover;
  border-radius: 6px;
  margin-bottom: 8px;
  background: #eee;
}
.comic-title {
  font-size: 16px;
  font-weight: 500;
  color: #222;
  margin-bottom: 4px;
  text-align: center;
  word-break: break-all;
}
.comic-update {
  font-size: 14px;
  color: #888;
  text-align: center;
}
.status-finished {
  color: #d32f2f;
  font-weight: bold;
}
.update-ep {
  color: #ff5722;
}
.no-data {
  text-align: center;
  color: #888;
  padding: 32px 0;
}
@media (max-width: 600px) {
  .home-header {
    flex-direction: column;
    align-items: flex-start;
    padding: 12px 8px 0 8px;
  }
  .home-search {
    margin-left: 0;
    width: 100%;
    min-width: 0;
    margin-top: 8px;
  }
  .comic-list-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px 8px;
    padding: 16px 8px 0 8px;
  }
  .comic-img {
    width: 90px;
    height: 120px;
  }
}
</style>
