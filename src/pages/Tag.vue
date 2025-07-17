<template>
  <div class="home">
    <div class="tag-bar">
      <span v-for="tag in tags" :key="tag" class="tag-item" @click="selectTag(tag)">{{ tag }}</span>
    </div>
    <div class="update-info" v-if="selectedTag">
      <span>标签【{{ selectedTag }}】下共 <span class="update-count">{{ comics.length }}</span> 本漫画</span>
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
          <van-button type="primary" size="small" @click.stop="goRead(comic)">{{ comic.hmanupdate }}</van-button>
        </div>
      </div>
    </div>
    <div v-if="selectedTag && !comics.length" class="no-data">暂无该标签漫画</div>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'TagPage',
  data() {
    return {
      tags: [],
      selectedTag: '',
      comics: []
    }
  },
  created() {
    this.fetchTags();
  },
  methods: {
    async fetchTags() {
      try {
        const res = await axios.get('http://192.168.3.110/vuehman/getHmanTag');
        this.tags = Array.isArray(res.data) ? res.data : (res.data.list || []);
      } catch (e) {
        this.$toast && this.$toast.fail('获取标签失败');
      }
    },
    async selectTag(tag) {
      this.selectedTag = tag;
      try {
        const res = await axios.get(`http://192.168.3.110/vuehman/searchAllByTag/${encodeURIComponent(tag)}`);
        this.comics = Array.isArray(res.data) ? res.data : (res.data.list || []);
      } catch (e) {
        this.$toast && this.$toast.fail('标签漫画获取失败');
      }
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
    }
  }
}
</script>

<style scoped>
.home {
  background: #fff;
  min-height: 100vh;
}
.tag-bar {
  padding: 12px 16px 0 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}
.tag-item {
  background: #f8f8fa;
  border-radius: 12px;
  padding: 6px 16px;
  color: #ff5722;
  font-size: 15px;
  cursor: pointer;
  border: 1px solid #eee;
  transition: background .2s, color .2s;
}
.tag-item:hover {
  background: #ff5722;
  color: #fff;
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
