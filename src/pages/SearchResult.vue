<template>
  <div class="home">
    <div class="update-info">
      <span>搜索到 <span class="update-count">{{ comics.length }}</span> 本相关漫画</span>
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
        <div class="comic-collect-btn">
          <van-button v-if="!comic.collected" type="warning" size="small" @click.stop="addCollect(comic.id)">收藏</van-button>
          <van-button v-else type="danger" size="small" @click.stop="removeCollect(comic.id)">取消收藏</van-button>
        </div>
      </div>
    </div>
    <div v-if="!comics.length" class="no-data">暂无搜索结果</div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SearchResult',
  data() {
    return {
      comics: [],
      keyword: ''
    }
  },
  watch: {
    '$route.query.keyword': {
      immediate: true,
      handler(val) {
        this.keyword = val || '';
        if (this.keyword.trim()) {
          this.onSearch();
        } else {
          this.comics = [];
        }
      }
    }
  },
  methods: {
    goHome() {
      this.$router.push({ path: '/' });
    },
    goRead(comic) {
      let id = '';
      if (comic.macpath) {
        const match = comic.macpath.match(/(\d+)$/);
        if (match) id = match[1];
      }
      if (id) {
        this.$router.push({ name: 'ComicReader', params: { id } });
      }
    },
    goDetail(id) {
      this.$router.push({ name: 'ComicDetail', params: { id } });
    },
    async onSearch() {
      if (!this.keyword) return;
      try {
        const res = await axios.get(`http://192.168.3.110/vuehman/searchAllByHmanname/${encodeURIComponent(this.keyword)}`);
        let list = Array.isArray(res.data) ? res.data : (res.data.list || []);
        // 查询收藏列表，标记已收藏
        const collectRes = await axios.get('http://192.168.3.110/vuehman/getHmanCollect');
        const collectIds = new Set((Array.isArray(collectRes.data) ? collectRes.data : (collectRes.data.list || [])).map(item => item.id));
        list.forEach(item => { item.collected = collectIds.has(item.id); });
        this.comics = list;
      } catch (e) {
        this.$toast && this.$toast.fail('搜索失败');
      }
    },
    async addCollect(id) {
      try {
        await axios.get(`http://192.168.3.110/vuehman/addHmanCollect/${id}`);
        this.$toast && this.$toast.success('已收藏');
        this.onSearch();
      } catch (e) {
        this.$toast && this.$toast.fail('收藏失败');
      }
    },
    async removeCollect(id) {
      try {
        await axios.get(`http://192.168.3.110/vuehman/removeHmanCollect/${id}`);
        this.$toast && this.$toast.success('已取消收藏');
        this.onSearch();
      } catch (e) {
        this.$toast && this.$toast.fail('取消收藏失败');
      }
    },
  }
}
</script>

<style scoped>
/* 复用 Home.vue 的样式，可根据需要调整 */
.home {
  background: #fff;
  min-height: 100vh;
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
