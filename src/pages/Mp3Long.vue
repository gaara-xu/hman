<template>
  <div class="mp3-page">
    <div class="mp3-list-grid">
      <div v-for="name in mp3s" :key="name" class="mp3-card" @click="goDetail(name)">
        <div class="mp3-title mp3-title-link">{{ name }}</div>
      </div>
    </div>
    <div v-if="!mp3s.length" class="no-data">暂无数据</div>
    <audio v-if="audioUrl" :src="audioUrl" controls autoplay style="width:100%;margin-top:24px;" />
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'Mp3Long',
  data() {
    return {
      mp3s: [],
      finished: true,
      audioUrl: ''
    }
  },
  created() {
    this.fetchMp3s();
  },
  methods: {
    async fetchMp3s() {
      try {
        const res = await axios.get('http://192.168.3.110/vuehman/getMp3sList');
        this.mp3s = res.data || [];
      } catch (e) {
        this.mp3s = [];
      }
    },
    goDetail(name) {
      this.$router.push({ name: 'Mp3LongDetail', params: { name } });
    }
  }
}
</script>

<style scoped>
.mp3-page { background: #fff; min-height: 100vh; padding: 24px; }
.mp3-list-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 24px 16px;
  padding: 24px 0 0 0;
}
.mp3-card {
  background: #fafafa;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.04);
  padding: 18px 8px 12px 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
  transition: box-shadow .2s;
}
.mp3-card:hover {
  box-shadow: 0 4px 16px rgba(0,0,0,0.10);
}
.mp3-title {
  font-size: 16px;
  font-weight: 500;
  color: #222;
  margin-bottom: 10px;
  text-align: center;
  word-break: break-all;
  cursor: pointer;
  transition: color .2s;
}
.mp3-title-link:hover {
  color: #ff5722;
}
.no-data { color: #888; text-align: center; margin: 32px 0; }
@media (max-width: 600px) {
  .mp3-list-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 16px 8px;
    padding: 16px 0 0 0;
  }
}
</style>
