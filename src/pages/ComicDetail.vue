<template>
  <div class="comic-detail" v-if="detail">
    <div class="detail-header">
      <img class="detail-cover" :src="detail.var2 ? detail.var2 : detail.hmanlogo" :alt="detail.hmanname" />
      <div class="detail-info">
        <h2 class="detail-title">{{ detail.hmanname }}</h2>
        <div class="detail-row">
          <span class="detail-label">类型：</span>{{ detail.hmantag }}
        </div>
        <div class="detail-row">
          <span class="detail-label">更新至：</span><span class="update-ep">{{ detail.hmanupdate }}</span>
        </div>
        <div class="detail-row">
          <span class="detail-label">漫画连载状态：</span>
          <span :class="isFinished ? 'status-finished' : 'status-serial'">
            {{ isFinished ? '已完结' : '连载中...' }}
          </span>
        </div>
        <div class="detail-desc">{{ detail.hmanremake }}</div>
        <div class="detail-btns">
          <van-button type="primary" icon="book-o" size="small">开始阅读</van-button>
          <van-button
            v-if="!detail.bookmark"
            type="default"
            icon="star-o"
            size="small"
            @click="addCollect"
          >收藏</van-button>
          <van-button
            v-else
            type="danger"
            icon="star"
            size="small"
            @click="removeCollect"
          >取消收藏</van-button>
          <van-button
            v-if="!isFinished"
            type="warning"
            icon="flag-o"
            size="small"
            @click="setFinished"
          >设为完结</van-button>
        </div>
      </div>
    </div>
    <div class="chapter-list">
      <div class="chapter-grid">
        <van-button
          v-for="chapter in chapters"
          :key="chapter.id"
          type="default"
          size="small"
          class="chapter-btn"
          @click="goRead(chapter)"
        >
          {{ chapter.strb || chapter.levelname }}
        </van-button>
      </div>
    </div>
  </div>
  <div v-else class="no-data">暂无数据</div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ComicDetail',
  data() {
    return {
      detail: null,
      chapters: [],
      isFinished: false
    }
  },
  created() {
    this.fetchDetail();
  },
  methods: {
    async addCollect() {
      if (!this.detail || !this.detail.id) return;
      try {
        await axios.get(`http://192.168.3.110/vuehman/addHmanCollect/${this.detail.id}`);
        this.$toast && this.$toast.success('已收藏');
        this.fetchDetail();
      } catch (e) {
        this.$toast && this.$toast.fail('收藏失败');
      }
    },
    async removeCollect() {
      if (!this.detail || !this.detail.id) return;
      try {
        await axios.get(`http://192.168.3.110/vuehman/removeHmanCollect/${this.detail.id}`);
        this.$toast && this.$toast.success('已取消收藏');
        this.fetchDetail();
      } catch (e) {
        this.$toast && this.$toast.fail('取消收藏失败');
      }
    },
    goRead(chapter) {
      // 优先用chapter.id，若无则回退macpath
      let id = chapter.id || '';
      if (!id && chapter.macpath) {
        const match = chapter.macpath.match(/(\d+)$/);
        if (match) id = match[1];
      }
      if (id) {
        this.$router.push({ name: 'ComicReader', params: { id } });
      }
    },
    cleanText(str) {
      if (!str) return '';
      return str.replace(/&[a-zA-Z]+;/g, '').replace(/…+/g, '');
    },
    async fetchDetail() {
      const id = this.$route.params.id;
      try {
        const res = await axios.get(`http://192.168.3.110/vuehman/getHmanDetail/${id}`);
        if (res.data && res.data.hmanDetail) {
          res.data.hmanDetail.hmanupdate = this.cleanText(res.data.hmanDetail.hmanupdate);
          // 判断完结状态
          this.isFinished = !!res.data.hmanDetail.hmanover;
        }
        this.detail = res.data.hmanDetail;
        // 按 level 升序排序
        this.chapters = (res.data.list || [])
          .map(chap => ({
            ...chap,
            strb: this.cleanText(chap.strb),
            levelname: this.cleanText(chap.levelname)
          }))
          .sort((a, b) => (a.level || 0) - (b.level || 0));
      } catch (e) {
        this.$toast && this.$toast.fail('加载失败');
      }
    },
    async setFinished() {
      if (!this.detail || !this.detail.id) return;
      try {
        await axios.get(`http://192.168.3.110/vuehman/updateHmanoverById/${this.detail.id}`);
        this.isFinished = true;
        this.$toast && this.$toast.success('已设为完结');
      } catch (e) {
        this.$toast && this.$toast.fail('操作失败');
      }
    }
  }
}
</script>

<style scoped>
.comic-detail {
  background: #fff;
  min-height: 100vh;
  padding: 24px 16px 0 16px;
}
.detail-header {
  display: flex;
  align-items: flex-start;
  gap: 32px;
  margin-bottom: 32px;
  flex-wrap: wrap;
}
.detail-cover {
  width: 180px;
  height: 260px;
  object-fit: cover;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  background: #eee;
}
.detail-info {
  flex: 1;
  min-width: 220px;
}
.detail-title {
  font-size: 28px;
  font-weight: bold;
  margin-bottom: 12px;
}
.detail-row {
  margin-bottom: 8px;
  font-size: 15px;
  color: #444;
  text-align: left;
  display: flex;
  align-items: center;
}
.detail-label {
  color: #ff5722;
  font-weight: 500;
  margin-right: 8px;
}
.status-finished {
  color: #d32f2f;
  font-weight: bold;
}
.status-serial {
  color: #2196f3;
  font-weight: bold;
}
.detail-desc {
  color: #444;
  margin-bottom: 16px;
  font-size: 15px;
  line-height: 1.7;
  text-align: left;
}
.detail-btns {
  display: flex;
  gap: 12px;
  margin-bottom: 8px;
}
.chapter-list {
  margin-top: 24px;
}
.chapter-title {
  color: #ff5722;
  font-size: 16px;
}
.chapter-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px 8px;
  margin-top: 12px;
  align-items: flex-start;
}
.chapter-btn {
  margin-bottom: 4px;
  min-width: 110px;
  max-width: 100%;
  white-space: pre-line;
  word-break: break-all;
  text-align: left;
  font-size: 15px;
  padding: 8px 14px;
  background: #f7f7f7;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0,0,0,0.03);
  transition: box-shadow .2s;
}
.chapter-btn:hover {
  box-shadow: 0 2px 8px rgba(0,0,0,0.10);
}
.no-data {
  text-align: center;
  color: #888;
  padding: 32px 0;
}
@media (max-width: 800px) {
  .detail-header {
    flex-direction: column;
    gap: 16px;
    align-items: center;
  }
  .detail-cover {
    width: 120px;
    height: 170px;
  }
  .detail-title {
    font-size: 20px;
  }
}
</style>
