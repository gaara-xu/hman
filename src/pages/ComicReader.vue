<template>
  <div class="comic-reader" v-if="hman">
    <div v-if="images.length" class="comic-reader-images">
      <img v-for="img in sortedImages" :key="img.url" :src="img.url" class="comic-img" />
    </div>
    <div v-if="!images.length && showUpdateBtn" class="update-center-btn">
      <button class="update-btn" @click="updateImages">点击更新</button>
    </div>
    <div class="comic-reader-nav custom-nav">
      <span class="nav-btn" @click="goPage('up')">上一页</span>
      <span class="nav-btn" @click="goHome">首页</span>
      <span class="nav-btn" @click="goCatalog">目录</span>
      <span class="nav-btn" @click="goPage('next')">下一页</span>
    </div>
    <div v-if="showPageTip" class="page-tip">{{ pageTipText }}</div>
    <div v-if="!images.length && !showUpdateBtn" class="no-data">暂无内容</div>
  </div>
  <div v-else class="no-data">暂无内容</div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ComicReader',
  data() {
    return {
      hman: null,
      images: [],
      upUrl: '',
      nextUrl: '',
      homeUrl: '',
      detailsUrl: '',
      showUpdateBtn: true,
      showPageTip: false,
      pageTipText: ''
    }
  },
  computed: {
    sortedImages() {
      // 特殊处理《一人之下》图片顺序
      if (this.hman && (this.hman.hmanname === '一人之下' || this.hman.name === '一人之下' || this.hman.title === '一人之下')) {
        // 按 xxx-数字.jpg 的数字部分升序排序
        return this.images.slice().sort((a, b) => {
          const getNum = url => {
            // 匹配 -数字.jpg
            const m = url.url.match(/-(\d+)\.(jpg|jpeg|png|webp|gif)$/i);
            return m ? parseInt(m[1], 10) : 0;
          };
          return getNum(a) - getNum(b);
        });
      } else {
        // 默认按 1-xxx.jpg 的 1 升序排序
        return this.images.slice().sort((a, b) => {
          const getNum = url => {
            const m = url.url.match(/\/(\d+)-/);
            return m ? parseInt(m[1], 10) : 0;
          };
          return getNum(a) - getNum(b);
        });
      }
    }
  },
  created() {
    this.fetchPage();
  },
  watch: {
    '$route.params.id': {
      immediate: false,
      handler() {
        this.fetchPage();
        window.scrollTo({ top: 0, left: 0, behavior: 'auto' });
      }
    }
  },
  methods: {
    async fetchPage() {
      const id = this.$route.params.id;
      try {
        const res = await axios.get(`http://192.168.3.110/vuehman/getHmanPage/${id}`);
        this.hman = res.data.hman;
        this.images = res.data.images || [];
        this.upUrl = res.data.upUrl;
        this.nextUrl = res.data.nextUrl;
        this.homeUrl = res.data.homeUrl;
        this.detailsUrl = res.data.detailsUrl;
        // 设置浏览器页签标题为“漫画名 - 第X话”，自动兼容字段名
        if (this.hman) {
          const comicName = this.hman.hmanname || this.hman.name || this.hman.title || '';
          // 优先使用 strb 字段作为章节名
          const chapterName = this.hman.strb || this.hman.levelname || this.hman.chaptername || this.hman.chapter || '';
          document.title = `${comicName}${chapterName ? ' - ' + chapterName : ''}`;
        }
        // 只要图片有数据就隐藏更新按钮
        if (this.images.length) {
          this.showUpdateBtn = true;
        }
      } catch (e) {
        this.$toast && this.$toast.fail('加载失败');
      }
    },
    async updateImages() {
      if (!this.hman || !this.hman.id) return;
      try {
        await axios.get(`http://192.168.3.110/vuehman/download/${this.hman.id}`);
        this.showUpdateBtn = false;
        this.$toast && this.$toast.success('已请求更新');
      } catch (e) {
        this.$toast && this.$toast.fail('更新失败');
      }
    },
    goPage(type) {
      let url = '';
      if (type === 'up') url = this.upUrl;
      if (type === 'next') url = this.nextUrl;
      // 判断是否为第一页/最后一页（url为'0'或'/vuehman/getHmanPage/0'）
      if (url === '0' || url === 0 || url === '/vuehman/getHmanPage/0') {
        this.pageTipText = type === 'up' ? '已经是第一页啦' : '已经是最后一页啦';
        this.showPageTip = true;
        setTimeout(() => { this.showPageTip = false; }, 1800);
        return;
      }
      if (url) {
        // 只取id参数（/vuehman/getHmanPage/38186）
        const match = url.match(/(\d+)$/);
        const id = match ? match[1] : '';
        // 如果 id 为 '0'，也不跳转
        if (id && id !== '0') {
          this.$router.push({ name: 'ComicReader', params: { id } });
        } else if (id === '0') {
          this.pageTipText = type === 'up' ? '已经是第一页啦' : '已经是最后一页啦';
          this.showPageTip = true;
          setTimeout(() => { this.showPageTip = false; }, 1800);
        }
      }
    },
    goHome() {
      // homeUrl 直接跳首页
      if (this.homeUrl) {
        this.$router.push(this.homeUrl);
      } else {
        this.$router.push('/');
      }
    },
    goCatalog() {
      // detailsUrl 取最后的id
      if (this.detailsUrl) {
        const match = this.detailsUrl.match(/(\d+)$/);
        const id = match ? match[1] : '';
        if (id) {
          this.$router.push({ name: 'ComicDetail', params: { id } });
        }
      }
    }
  }
}
</script>

<style scoped>
.comic-reader {
  background: #fff;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
}
.comic-reader-images {
  width: 100vw;
  max-width: 900px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
}
.comic-img {
  width: 100%;
  max-width: 900px;
  margin-bottom: 0;
  background: #eee;
  border-radius: 4px;
}
/* 桌面端更高，移动端自适应优化 */
.comic-reader-nav {
  width: 100vw;
  max-width: 900px;
  margin: 24px auto 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 26px;
  color: #222;
  background: rgba(255,255,255,0.92);
  padding: 32px 0 32px 0;
  border-radius: 18px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.08);
}
.custom-nav {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 100;
  width: 100vw;
  max-width: 900px;
  margin: 0 auto 0 auto;
  background: rgba(255,255,255,0.92);
  border-radius: 18px 18px 0 0;
  box-shadow: 0 -2px 16px rgba(0,0,0,0.10);
  padding: 32px 0 32px 0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.nav-btn {
  cursor: pointer;
  padding: 0 40px;
  font-size: 1em;
  transition: color .2s, background .2s;
  border-radius: 10px;
  user-select: none;
}
.nav-btn:hover {
  color: #ff5722;
  background: rgba(255,87,34,0.08);
}
@media (max-width: 800px) {
  .comic-reader-nav,
  .custom-nav {
    font-size: 20px;
    padding: 18px 0 18px 0;
    border-radius: 12px 12px 0 0;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
  }
  .nav-btn {
    padding: 0 10px;
    font-size: 0.98em;
    min-width: 0;
    flex: 1 1 0;
    text-align: center;
  }
}
.update-center-btn {
  position: fixed;
  left: 0;
  right: 0;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 200;
}
.update-btn {
  background: #ff5722;
  color: #fff;
  font-size: 22px;
  border: none;
  border-radius: 8px;
  padding: 16px 40px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.10);
  cursor: pointer;
  font-weight: bold;
  transition: background .2s;
}
.update-btn:hover {
  background: #d32f2f;
}
.no-data {
  text-align: center;
  color: #888;
  padding: 32px 0;
}
.page-tip {
  position: fixed;
  left: 50%;
  bottom: 80px;
  transform: translateX(-50%);
  background: linear-gradient(90deg, #ffb199 0%, #ff0844 100%);
  color: #fff;
  font-size: 18px;
  padding: 12px 32px;
  border-radius: 24px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.10);
  z-index: 999;
  opacity: 0.92;
  pointer-events: none;
  animation: fadeInOut 2s;
}
@keyframes fadeInOut {
  0% { opacity: 0; }
  10% { opacity: 0.92; }
  90% { opacity: 0.92; }
  100% { opacity: 0; }
}
</style>
