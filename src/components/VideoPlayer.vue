<template>
  <div class="video-player" ref="container">
    <video
      ref="videoEl"
      :src="src"
      playsinline
      webkit-playsinline
      loop
      muted
      preload="auto"
      @click="togglePlay"
    ></video>
  </div>
</template>

<script>
import { ref, onMounted, onBeforeUnmount, watch } from 'vue';

export default {
  name: 'VideoPlayer',
  props: { src: { type: String, required: true }, active: { type: Boolean, default: false } },
  emits: ['seek'],
  setup(props, { emit }) {
    const videoEl = ref(null);
    let touchStartX = 0;
    let touchStartY = 0;

    const play = async () => {
      try {
        await videoEl.value.play();
      } catch (e) { console.warn(e); }
    };

    const pause = () => {
      try { videoEl.value.pause(); } catch (e) { console.warn(e); }
    };

    const togglePlay = () => {
      if (!videoEl.value) return;
      if (videoEl.value.paused) play(); else pause();
    };

    const seekBy = (seconds) => {
      if (!videoEl.value) return;
      try {
        videoEl.value.currentTime = Math.max(0, Math.min(videoEl.value.duration || 0, videoEl.value.currentTime + seconds));
        emit('seek', videoEl.value.currentTime);
      } catch (e) { console.warn(e); }
    };

    const onTouchStart = (e) => {
      const t = e.touches && e.touches[0];
      if (t) { touchStartX = t.clientX; touchStartY = t.clientY; }
    };

    const onTouchEnd = (e) => {
      const t = e.changedTouches && e.changedTouches[0];
      if (!t) return;
      const dx = t.clientX - touchStartX;
      const dy = t.clientY - touchStartY;
      if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 30) {
        // horizontal swipe => seek
        if (dx > 0) seekBy(-10); else seekBy(10);
      }
    };

    onMounted(() => {
      if (props.active) play();
      const el = videoEl.value;
      if (el) {
        el.addEventListener('touchstart', onTouchStart, { passive: true });
        el.addEventListener('touchend', onTouchEnd, { passive: true });
      }
    });

    onBeforeUnmount(() => {
      pause();
      const el = videoEl.value;
      if (el) {
        el.removeEventListener('touchstart', onTouchStart);
        el.removeEventListener('touchend', onTouchEnd);
      }
    });

    watch(() => props.active, (val) => {
      if (val) play(); else pause();
    });

    return { videoEl, play, pause, togglePlay, seekBy };
  }
}
</script>

<style scoped>
.video-player {
  width: 100%;
  height: 100%;
  background: #000;
}
.video-player video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
</style>
