import { createRouter, createWebHistory } from 'vue-router';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('./views/HomeView.vue')
    },
    {
      path: '/village',
      name: 'village',
      component: () => import('./views/VillageView.vue')
    }
  ]
});

export default router;