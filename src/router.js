import { createRouter, createWebHistory } from 'vue-router';


import Home from './pages/Home.vue';
import ComicDetail from './pages/ComicDetail.vue';
import ComicReader from './pages/ComicReader.vue';
import SearchResult from './pages/SearchResult.vue';

const routes = [
  { path: '/', component: Home },
  { path: '/detail/:id', name: 'ComicDetail', component: ComicDetail },
  { path: '/read/:id', name: 'ComicReader', component: ComicReader },
  { path: '/search', name: 'SearchResult', component: SearchResult },
  { path: '/collect', name: 'Collect', component: () => import('./pages/Collect.vue') },
  { path: '/tag', name: 'Tag', component: () => import('./pages/Tag.vue') }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
