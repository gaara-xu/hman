<template>
  <div class="mp3-page">
    <div class="mp3-list-scroll">
      <div v-for="name in mp3s" :key="name" class="mp3-list-item" @click="playMp3(name)">
        <span class="mp3-title-link">{{ name.replace(/\.mp3$/i, '') }}</span>
      </div>
    </div>
    <div v-if="!mp3s.length" class="no-data">暂无数据</div>
    <audio v-if="audioUrl" :src="audioUrl" controls autoplay style="width:100%;margin-top:24px;" />
  </div>
</template>

<script>
import axios from 'axios';
export default {
  name: 'Mp3Short',
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
        const res = await axios.get('http://192.168.3.110/vuehman/getMp3List');
        this.mp3s = res.data || [];
      } catch (e) {
        this.mp3s = [];
      }
    },
    playMp3(name) {
      // 短篇播放地址 /mp3p/xxx.mp3
      let file = name;
      if (file.endsWith('.mp3')) file = file.replace(/\.mp3$/, '');
      this.audioUrl = `http://192.168.3.110:8888/mp3p/${file}.mp3`;
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
.mp3-list-scroll {
  max-height: 70vh;
  overflow-y: auto;
  padding: 0 0 12px 0;
  margin-bottom: 12px;
}
.mp3-list-item {
  padding: 14px 18px;
  border-bottom: 1px solid #eee;
  font-size: 16px;
  color: #222;
  cursor: pointer;
  transition: background .2s, color .2s;
  user-select: none;
}
.mp3-list-item:hover {
  background: #f7f7f7;
  color: #ff5722;
}
.mp3-title-link {
  font-weight: 500;
  word-break: break-all;
}
</style>
