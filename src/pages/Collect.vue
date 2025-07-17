<template>
  <div class="home">
    <div class="update-info">
      <span>已收藏 <span class="update-count">{{ comics.length }}</span> 本漫画</span>
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
        <div class="comic-collect-btn">
          <van-button type="danger" size="small" @click.stop="removeCollect(comic.id)">取消收藏</van-button>
        </div>
      </div>
    </div>
    <div v-if="!comics.length" class="no-data">暂无收藏漫画</div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'CollectPage',
  data() {
    return {
      comics: []
    }
  },
  created() {
    this.fetchCollect();
  },
  methods: {
    async fetchCollect() {
      try {
        const res = await axios.get('http://192.168.3.110/vuehman/getHmanCollect');
        this.comics = Array.isArray(res.data) ? res.data : (res.data.list || []);
      } catch (e) {
        this.$toast && this.$toast.fail('获取收藏失败');
      }
    },
    async removeCollect(id) {
      try {
        await axios.get(`http://192.168.3.110/vuehman/removeHmanCollect/${id}`);
        this.$toast && this.$toast.success('已取消收藏');
        this.fetchCollect();
      } catch (e) {
        this.$toast && this.$toast.fail('取消收藏失败');
      }
    },
    goDetail(id) {
      this.$router.push({ name: 'ComicDetail', params: { id } });
    }
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
.comic-collect-btn {
  margin-top: 8px;
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
