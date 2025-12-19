<template>
  <div class="video-card" :data-index="index">
    <VideoPlayer :src="video.src" :active="index === activeIndex" />
    <div class="overlay">
      <div class="left">
        <div class="author">@{{ video.author }}</div>
        <div class="title">{{ video.title }}</div>
      </div>
      <div class="right">
        <div class="actions">
          <div class="action">❤</div>
          <div class="action">💬</div>
          <div class="action">↗</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import VideoPlayer from './VideoPlayer.vue';

export default {
  name: 'VideoCard',
  components: { VideoPlayer },
  props: {
    video: { type: Object, required: true },
    index: { type: Number, required: true },
    activeIndex: { type: Number, required: true }
  }
}
</script>

<style scoped>
.video-card {
  position: relative;
  width: 100%;
  height: 100vh;
  background: #000;
}
.overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 24px;
  display: flex;
  justify-content: space-between;
  padding: 0 16px;
  color: #fff;
  pointer-events: none;
}
.left { text-align: left; pointer-events: auto; }
.author { font-weight: 700; margin-bottom: 6px; }
.title { opacity: 0.95; }
.right .actions { display:flex; flex-direction: column; gap:12px; pointer-events: auto; }
.action { background: rgba(0,0,0,0.4); padding:8px; border-radius:50%; }
</style>
