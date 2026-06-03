<template>
  <div class="tiktok-root" @wheel.passive="onWheel">
    <div
      class="feed"
      :style="feedStyle"
      ref="feedRef"
    >
      <div v-for="(v, idx) in videos" :key="v.id" class="video-card">
        <video
          v-if="Math.abs(idx - activeIndex) <= 1"
          :ref="el => setVideoRef(el, idx)"
          :src="v.src"
          playsinline
          webkit-playsinline
          loop
          preload="auto"
          @click="togglePlay(idx, $event)"
          @timeupdate="syncProgress(idx, $event)"
          @loadedmetadata="syncProgress(idx, $event)"
          @durationchange="syncProgress(idx, $event)"
        ></video>

        <div class="overlay">
          <div class="info-section">
            <div class="title">{{ formatTitle(v.title) }}</div>
          </div>
        </div>
      </div>
    </div>

    <div v-if="videos.length > 0" class="side-bar">
      <button class="action-btn" @click.stop="toggleAudio">
        <div class="icon">{{ audioUnlocked ? '🔊' : '🔇' }}</div>
        <div class="text">{{ audioUnlocked ? '关闭' : '开启' }}</div>
      </button>
    </div>

    <div
      v-if="videos.length > 0"
      class="progress-bar"
      @click.stop
      @touchstart.stop
      @touchmove.stop
      @touchend.stop
    >
      <input
        class="progress-input"
        type="range"
        min="0"
        max="1000"
        step="1"
        :value="progressValue"
        :style="progressStyle"
        @input="seekToProgress"
      />
    </div>

    <div v-if="videos.length === 0" class="empty">视频库空空如也...</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, nextTick, onBeforeUnmount } from 'vue';
import axios from 'axios';

const API_ROOT = 'http://192.168.3.110:8080';

const videos = ref([]);
const activeIndex = ref(0);
const videoRefs = ref([]);
const currentTime = ref(0);
const duration = ref(0);

const touch = {
  startY: 0,
  startTime: 0
};

const formatTitle = (title) => {
  if (!title) return '未命名视频';
  return title.replace(/\.mp4$/i, '');
};

const setVideoRef = (el, idx) => {
  if (el) videoRefs.value[idx] = el;
};

const getViewportHeight = () => {
  return (window.visualViewport && window.visualViewport.height) || window.innerHeight;
};

const cardHeight = ref(getViewportHeight());
const feedRef = ref(null);

const feedStyle = computed(() => {
  const baseOffsetPx = -activeIndex.value * cardHeight.value;

  return {
    transform: `translateY(${baseOffsetPx}px)`,
    transition: 'none',
    display: 'flex',
    flexDirection: 'column',
    height: '100%'
  };
});

// 音频解锁状态（放在前面以供 updatePlayState 使用）
const audioUnlocked = ref(false);

const progressValue = computed(() => {
  if (!duration.value) return 0;
  return Math.round((currentTime.value / duration.value) * 1000);
});

const progressPercent = computed(() => {
  return Math.max(0, Math.min(100, progressValue.value / 10));
});

const progressStyle = computed(() => ({
  background: `linear-gradient(to right, rgba(255,255,255,0.9) ${progressPercent.value}%, rgba(255,255,255,0.28) ${progressPercent.value}%)`
}));

// 通过 id 请求视频列表并更新视图
/* fetchList 已在文件上方定义并用于导航 */

// 设置当前 id（通知后端）
/* setCurrentId 已在文件上方定义并用于导航 */

const applyAudioState = (el, forceMuted = false) => {
  el.muted = forceMuted || !audioUnlocked.value;
  el.volume = 1;
};

const playVideo = async (el) => {
  applyAudioState(el);
  try {
    await el.play();
    return true;
  } catch (err) {
    if (!audioUnlocked.value) {
      console.warn('playVideo: muted play rejected', err);
      return false;
    }

    // Chrome 移动端可能拒绝异步切换后的有声自动播放，降级为静音播放避免黑屏卡住。
    applyAudioState(el, true);
    try {
      await el.play();
      return true;
    } catch (mutedErr) {
      console.warn('playVideo: fallback muted play rejected', mutedErr);
      return false;
    }
  }
};

const updatePlayState = () => {
  videoRefs.value.forEach((el, i) => {
    if (!el) return;
    if (i === activeIndex.value) {
      playVideo(el);
    } else {
      el.pause();
      el.currentTime = 0;
    }
  });
};

const resetPlaybackState = () => {
  audioUnlocked.value = false;
  currentTime.value = 0;
  duration.value = 0;
};

const syncProgress = (idx, ev) => {
  if (idx !== activeIndex.value) return;
  const el = ev && ev.currentTarget;
  if (!el) return;
  currentTime.value = el.currentTime || 0;
  duration.value = Number.isFinite(el.duration) ? el.duration : 0;
};

const seekToProgress = (ev) => {
  const el = videoRefs.value[activeIndex.value];
  if (!el || !duration.value) return;
  const value = Number(ev.target.value);
  const nextTime = (value / 1000) * duration.value;
  el.currentTime = Math.max(0, Math.min(duration.value, nextTime));
  currentTime.value = el.currentTime;
};

const togglePlay = async (idx, ev) => {
  // 优先使用 event 提供的元素，回退到 refs（防止元素被替换导致 ref 未及时更新）
  const elFromEvent = ev && (ev.currentTarget || ev.target);
  const el = elFromEvent || videoRefs.value[idx];
  console.log('togglePlay called', { idx, hasEventEl: !!elFromEvent, refElPresent: !!videoRefs.value[idx] });
  if (!el) {
    console.warn('togglePlay: no video element found for idx', idx);
    return;
  }

  const tryPlay = async () => {
    try {
      await el.play();
      console.log('togglePlay: play succeeded');
      return true;
    } catch (err) {
      console.warn('togglePlay: play() rejected', err);
      return false;
    }
  };

  if (el.paused) {
    // 点击视频只负责播放/暂停，声音状态由右侧按钮独立控制
    applyAudioState(el);

    // 如果 readyState 低，先 load 一下再试
    if (el.readyState < HTMLMediaElement.HAVE_ENOUGH_DATA) {
      try {
        el.load();
      } catch (err) {
        console.warn('togglePlay: load failed', err);
      }
    }

    let ok = await playVideo(el);
    if (!ok) {
      // 第二次尝试：短延迟后再试
      await new Promise(r => setTimeout(r, 120));
      ok = await tryPlay();
    }

    if (!ok) {
      // 最后手段：把 currentTime 重置并再试
      try {
        el.currentTime = Math.max(0, (el.currentTime || 0) - 0.01);
      } catch (e) {
        console.warn('togglePlay: adjust currentTime failed', e);
      }
      await new Promise(r => setTimeout(r, 200));
      await tryPlay();
    }
  } else {
    el.pause();
    console.log('togglePlay: paused');
  }
};

const toggleAudio = () => {
  audioUnlocked.value = !audioUnlocked.value;
  const el = videoRefs.value[activeIndex.value];
  if (!el) return;
  applyAudioState(el);
  if (!el.paused) {
    playVideo(el);
  }
};

const onTouchStart = (e) => {
  const t = e.touches && e.touches[0];
  if (!t) return;
  touch.startY = t.clientY;
  touch.startTime = Date.now();
};

const onTouchMove = (e) => {
  // 必须 preventDefault：很多 WebView/iOS 不然会被系统手势吞掉
  if (e.cancelable) e.preventDefault();
};

const attachTouch = () => {
  if (!feedRef.value) return;
  feedRef.value.addEventListener('touchstart', onTouchStart, { passive: false });
  feedRef.value.addEventListener('touchmove', onTouchMove, { passive: false });
  feedRef.value.addEventListener('touchend', onTouchEnd, { passive: false });
  feedRef.value.addEventListener('touchcancel', onTouchEnd, { passive: false });
};

const detachTouch = () => {
  if (!feedRef.value) return;
  feedRef.value.removeEventListener('touchstart', onTouchStart);
  feedRef.value.removeEventListener('touchmove', onTouchMove);
  feedRef.value.removeEventListener('touchend', onTouchEnd);
  feedRef.value.removeEventListener('touchcancel', onTouchEnd);
};

const onWheel = async (e) => {
  if (Math.abs(e.deltaY) < 10) return;
  const currentId = videos.value[activeIndex.value] && videos.value[activeIndex.value].id;
  if (currentId == null) return;
  // 按用户要求：上滑对应 id-1，下滑对应 id+1。wheel.deltaY>0 表示向下滚动（用户看作上滑/下一条）
  const targetId = e.deltaY > 0 ? currentId - 1 : currentId + 1;
  await setCurrentId(targetId);
  await fetchList(targetId);
};

const onTouchEnd = async (e) => {
  const t = e.changedTouches && e.changedTouches[0];
  if (!t) return;

  const endY = t.clientY;
  const diffY = endY - touch.startY;

  const thresholdY = cardHeight.value / 6; // 翻页阈值（基于卡片高度）

  // 垂直翻页逻辑：按用户要求基于 id 进行导航（上滑 id-1，下滑 id+1），然后重新拉取视频列表
  if (Math.abs(diffY) > thresholdY) {
    const currentId = videos.value[activeIndex.value] && videos.value[activeIndex.value].id;
    if (currentId != null) {
      // 用户要求：向上滑动 => id + 1，向下滑动 => id - 1
      const targetId = diffY < 0 ? currentId + 1 : currentId - 1;
      await setCurrentId(targetId);
      await fetchList(targetId);
    }
  }

  await nextTick();
  updatePlayState();
};

const updateCardHeight = () => {
  // 移动端 Chrome 地址栏会改变可视高度，优先使用实际卡片高度和 visualViewport
  const el = document.querySelector('.video-card');
  cardHeight.value = (el && el.clientHeight) || getViewportHeight();
};

window.addEventListener('resize', updateCardHeight);
if (window.visualViewport) {
  window.visualViewport.addEventListener('resize', updateCardHeight);
}
onBeforeUnmount(() => {
  window.removeEventListener('resize', updateCardHeight);
  if (window.visualViewport) {
    window.visualViewport.removeEventListener('resize', updateCardHeight);
  }
  detachTouch();
});

// 删除功能已从 UI 中移除；如需恢复请实现并在模板中调用

const fetchList = async (startId) => {
  try {
    const params = startId !== undefined && startId !== null ? { params: { id: startId } } : {};
    const res = await axios.get(`${API_ROOT}/tiktok/tiktokList`, params);
    const list = Array.isArray(res.data) ? res.data : [];
    resetPlaybackState();
    videos.value = list.map(it => ({ id: it.id, src: it.url, title: it.name }));
    activeIndex.value = 0;
    await nextTick();
    updatePlayState();
  } catch (err) {
    console.error('加载失败', err);
  }
};

const setCurrentId = async (id) => {
  if (id == null) return;
  try {
    await axios.post(`${API_ROOT}/tiktok/setCurrentId`, null, { params: { id } });
  } catch (err) {
    console.warn('设置当前 id 失败', err);
  }
};

const init = async () => {
  await fetchList();
};

onMounted(init);
onMounted(() => {
  // 测量初始卡片高度并绑定触摸监听（使用非被动监听以便 preventDefault 生效）
  nextTick().then(() => {
    updateCardHeight();
    attachTouch();
  });
});
</script>

<style scoped>
.tiktok-root {
  height: 100vh;
  height: 100svh;
  height: 100dvh;
  width: 100vw;
  overflow: hidden;
  background: #000;
  position: relative;
  touch-action: none;
}

.feed {
  width: 100%;
  height: 100%;
  will-change: transform;
  touch-action: none;
}

.video-card {
  width: 100%;
  height: 100vh;
  height: 100svh;
  height: 100dvh;
  flex-shrink: 0;
  position: relative;
  overflow: hidden;
}

video {
  width: 100%;
  height: 100%;
  object-fit: contain;
  background: #000;
  touch-action: none;
}

.overlay {
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 200px;
  background: linear-gradient(to top, rgba(0,0,0,0.6), transparent);
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  padding: 30px 20px;
  color: white;
  pointer-events: none;
  z-index: 10;
  box-sizing: border-box;
}

.info-section { text-align: left; }
.title { font-size: 0.95rem; text-shadow: 1px 1px 2px #000; }

.side-bar {
  position: fixed;
  right: max(12px, env(safe-area-inset-right, 0px));
  bottom: max(88px, calc(env(safe-area-inset-bottom, 0px) + 72px));
  z-index: 20;
  pointer-events: auto;
}
.action-btn {
  background: rgba(255, 255, 255, 0.1);
  width: 54px;
  min-height: 54px;
  padding: 8px 6px;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  color: #fff;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.action-btn .icon { font-size: 20px; }
.action-btn .text {
  font-size: 10px;
  line-height: 1;
  margin-top: 3px;
  white-space: nowrap;
}

.progress-bar {
  position: fixed;
  left: 0;
  right: 0;
  bottom: env(safe-area-inset-bottom, 0px);
  height: 18px;
  z-index: 30;
  display: flex;
  align-items: flex-end;
  opacity: 0.7;
  pointer-events: auto;
}

.progress-input {
  width: 100%;
  height: 18px;
  margin: 0;
  padding: 0;
  border: 0;
  outline: none;
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
}

.progress-input::-webkit-slider-runnable-track {
  height: 4px;
  border: 0;
}

.progress-input::-webkit-slider-thumb {
  width: 18px;
  height: 18px;
  margin-top: -7px;
  border: 0;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.45);
  appearance: none;
  -webkit-appearance: none;
}

.progress-input::-moz-range-track {
  height: 4px;
  border: 0;
  background: transparent;
}

.progress-input::-moz-range-thumb {
  width: 18px;
  height: 18px;
  border: 0;
  border-radius: 50%;
  background: #fff;
  box-shadow: 0 0 8px rgba(0, 0, 0, 0.45);
}

@media (max-height: 640px) {
  .side-bar {
    bottom: max(64px, calc(env(safe-area-inset-bottom, 0px) + 48px));
  }
}

.empty { color: #555; padding-top: 45vh; text-align: center; }
</style>
