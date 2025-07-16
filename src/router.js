import { createRouter, createWebHistory } from 'vue-router';

import Home from './pages/Home.vue';
import ComicDetail from './pages/ComicDetail.vue';

import ComicReader from './pages/ComicReader.vue';
const routes = [
  { path: '/', component: Home },
  { path: '/detail/:id', name: 'ComicDetail', component: ComicDetail },
  { path: '/read/:id', name: 'ComicReader', component: ComicReader }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
