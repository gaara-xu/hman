import { createRouter, createWebHistory } from 'vue-router';
// 确保文件名路径完全匹配，建议使用大写开头的驼峰命名
import HomePage from './pages/HomePage.vue'; 

const routes = [
  { 
    path: '/', 
    name: 'HomePage', // 建议这里也对应修改
    component: HomePage 
  },
  { 
    // 捕获所有 404 路由并重定向到首页
    path: '/:catchAll(.*)', 
    redirect: '/' 
  }
];

const router = createRouter({
  // 内网环境下使用 WebHistory 是没问题的
  history: createWebHistory(),
  routes
});

export default router;