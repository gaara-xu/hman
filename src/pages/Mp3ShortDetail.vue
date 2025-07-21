<template>
  <div class="mp3-detail-page">
    <h2>《{{ name }}》音频合集</h2>
    <div class="mp3-list-grid">
      <div v-for="ep in episodes" :key="ep" class="mp3-card" @click="playMp3(ep)">
        <div class="mp3-title mp3-title-link">{{ ep }}</div>
      </div>
    </div>
    <div v-if="!episodes.length" class="no-data">暂无数据</div>
    <audio v-if="audioUrl" :src="audioUrl" controls autoplay style="width:100%;margin-top:24px;" />
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'Mp3ShortDetail',
  data() {
    return {
      name: '',
      episodes: [],
      audioUrl: ''
    }
  },
  created() {
    this.name = this.$route.params.name;
    this.fetchDetail();
  },
  methods: {
    async fetchDetail() {
      try {
        const res = await axios.get(`http://192.168.3.110/vuehman/getMp3Info/${encodeURIComponent(this.name)}`);
        this.episodes = res.data || [];
      } catch (e) {
        this.episodes = [];
      }
    },
    playMp3(ep) {
      let file = ep;
      if (file.endsWith('.mp3')) file = file.replace(/\.mp3$/, '');
      this.audioUrl = `http://192.168.3.110:8888/mp3p/${file}.mp3`;
    }
  }
}
</script>

<style scoped>
.mp3-detail-page { background: #fff; min-height: 100vh; padding: 24px; }
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
