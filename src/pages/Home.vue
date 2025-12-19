<template>
  <div class="tiktok-root">
    <div class="feed" ref="feed" @touchstart.passive="onTouchStart" @touchend.passive="onTouchEnd">
      <VideoCard
        v-for="(v, idx) in videos"
        :key="v.id"
        :video="v"
        :active-index="activeIndex"
        :index="idx"
      />
    </div>

    <div class="controls">
      <button class="ctrl" @click="prev">上一个</button>
      <button class="ctrl delete" @click="deleteCurrent">删除</button>
      <button class="ctrl" @click="next">下一个</button>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import axios from 'axios';
import VideoCard from '../components/VideoCard.vue';

export default {
  name: 'TiktokHome',
  components: { VideoCard },
  setup() {
    const feed = ref(null);
    const videos = ref([]);
    const activeIndex = ref(0);
    const touch = { startX: 0, startY: 0 };
    const API_ROOT = 'http://192.168.3.110:8080';

    const fetchWindow = async (startId) => {
      try {
        const res = await axios.get(`${API_ROOT}/tiktok/tiktokList`, { params: { id: startId } });
        const list = Array.isArray(res.data) ? res.data : [];
        videos.value = list.map(it => ({ id: it.id, src: it.url, title: it.name, author: it.name }));
        activeIndex.value = 0;
        // ensure feed scrolled to top
        scrollToIndex(activeIndex.value);
      } catch (e) {
        videos.value = [];
      }
    };

    const scrollToIndex = (idx) => {
      if (!feed.value) return;
      const h = window.innerHeight || document.documentElement.clientHeight;
      feed.value.scrollTo({ top: idx * h, behavior: 'smooth' });
    };

    const prev = async () => {
      if (!videos.value.length) return;
      const cur = videos.value[activeIndex.value];
      const desiredId = cur.id - 1;
      const foundIdx = videos.value.findIndex(v => v.id === desiredId);
      if (foundIdx >= 0) {
        activeIndex.value = foundIdx;
        scrollToIndex(activeIndex.value);
        return;
      }
      // not cached, fetch window starting from desiredId
      await fetchWindow(desiredId);
    };

    const next = async () => {
      if (!videos.value.length) return;
      const cur = videos.value[activeIndex.value];
      const desiredId = cur.id + 1;
      const foundIdx = videos.value.findIndex(v => v.id === desiredId);
      if (foundIdx >= 0) {
        activeIndex.value = foundIdx;
        scrollToIndex(activeIndex.value);
        return;
      }
      await fetchWindow(desiredId);
    };

    const deleteCurrent = async () => {
      if (!videos.value.length) return;
      const cur = videos.value[activeIndex.value];
      try {
        const res = await axios.post(`${API_ROOT}/tiktok/deleteByid`, null, { params: { id: cur.id } });
        if (res && Number(res.data) === 1) {
          // after deletion backend reindexes; fetch at same id
          await fetchWindow(cur.id);
        } else {
          console.warn('delete failed', res && res.data);
        }
      } catch (e) {
        console.error(e);
      }
    };

    const onTouchStart = (e) => {
      const t = e.touches && e.touches[0];
      if (t) { touch.startX = t.clientX; touch.startY = t.clientY; }
    };

    const onTouchEnd = (e) => {
      const t = e.changedTouches && e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - touch.startX;
      const dy = t.clientY - touch.startY;
      // vertical swipe for change
      if (Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 50) {
        if (dy < 0) next(); else prev();
      }
    };

    onMounted(async () => {
      // initial load starting from id=1
      await fetchWindow(1);
    });

    return { feed, videos, activeIndex, prev, next, deleteCurrent, onTouchStart, onTouchEnd };
  }
}
</script>

<style scoped>
.tiktok-root { height: 100vh; width: 100%; overflow: hidden; position: relative; background: #000; }
.feed { height: 100vh; overflow-y: auto; scroll-snap-type: y mandatory; }
.feed :deep(.video-card) { height: 100vh; scroll-snap-align: start; }
.controls { position: fixed; left: 0; right: 0; bottom: 12px; display:flex; justify-content:center; gap:16px; z-index:40; }
.ctrl { padding:10px 18px; background: rgba(0,0,0,0.5); color:#fff; border-radius:6px; border: none; font-size:16px; }
.ctrl.delete { background: rgba(200,30,30,0.9); }
</style>
