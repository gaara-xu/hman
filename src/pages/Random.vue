<template>
  <div class="home">
    <div class="update-info">
      <span>随机推荐 <span class="update-count">{{ comics.length }}</span> 本漫画</span>
      <van-button type="primary" size="small" plain :loading="loading" @click="fetchRandom">
        换一批
      </van-button>
    </div>
    <div class="comic-list-grid">
      <div v-for="comic in comics" :key="comic.id" class="comic-card">
        <div class="img-wrap">
          <img
            class="comic-img"
            :src="comic.var2 ? comic.var2 : comic.hmanlogo"
            :alt="comic.hmanname"
            @click="goDetail(comic.id)"
          />
          <span v-if="comic.bookmark === '已收藏'" class="collect-corner" title="已收藏">
            <div class="corner-triangle">
              <span class="corner-star">★</span>
            </div>
          </span>
        </div>
        <div class="comic-title" @click="goDetail(comic.id)">{{ comic.hmanname }}</div>
        <div class="comic-update">
          <template v-if="comic.hmanover">
            <span class="status-finished">已完结</span>
          </template>
          <template v-else>
            更新：<span class="update-ep">{{ comic.hmanupdate || '—' }}</span>
          </template>
        </div>
        <div v-if="comic.hmanupdate && comic.macpath" class="comic-read-btn">
          <van-button type="primary" size="small" @click.stop="goRead(comic)">
            {{ comic.hmanupdate }}
          </van-button>
        </div>
      </div>
    </div>
    <div v-if="!loading && !comics.length" class="no-data">暂无漫画数据</div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'RandomPage',
  data() {
    return {
      comics: [],
      loading: false
    };
  },
  watch: {
    '$route.query.t'() {
      this.fetchRandom();
    }
  },
  created() {
    this.fetchRandom();
  },
  methods: {
    async fetchRandom() {
      if (this.loading) return;
      this.loading = true;
      try {
        const res = await axios.get('http://192.168.3.110:8080/vuehman/randomHman/40');
        this.comics = Array.isArray(res.data) ? res.data : (res.data?.list || []);
      } catch (e) {
        this.$toast && this.$toast.fail('获取随机漫画失败');
      } finally {
        this.loading = false;
      }
    },
    goDetail(id) {
      this.$router.push({ name: 'ComicDetail', params: { id } });
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
    }
  }
};
</script>

<style scoped>
.home {
  background: #fff;
  min-height: 100vh;
  padding: 12px 16px 28px;
}
.update-info {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
  font-size: 14px;
  color: #555;
}
.update-count {
  color: #ff5722;
  font-weight: 700;
}
.comic-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 14px;
}
.comic-card {
  display: flex;
  flex-direction: column;
  background: #fff;
  border-radius: 10px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
  padding-bottom: 10px;
}
.img-wrap {
  position: relative;
  width: 100%;
  aspect-ratio: 3 / 4;
  overflow: hidden;
  background: #f5f5f5;
}
.comic-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  cursor: pointer;
}
.collect-corner {
  position: absolute;
  top: 0;
  right: 0;
}
.corner-triangle {
  width: 0;
  height: 0;
  border-top: 32px solid #ffb300;
  border-left: 32px solid transparent;
  position: relative;
}
.corner-star {
  position: absolute;
  top: -30px;
  right: 3px;
  color: #fff;
  font-size: 12px;
}
.comic-title {
  margin: 8px 8px 4px;
  font-size: 14px;
  font-weight: 600;
  color: #222;
  cursor: pointer;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.comic-update {
  margin: 0 8px 8px;
  font-size: 12px;
  color: #888;
}
.status-finished { color: #2e7d32; font-weight: 600; }
.update-ep { color: #ff5722; }
.comic-read-btn {
  margin: 0 8px;
}
.no-data {
  text-align: center;
  color: #999;
  padding: 48px 0;
}
@media (max-width: 600px) {
  .home { padding: 10px 8px 24px; }
  .comic-list-grid {
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 8px;
  }
}
</style>
