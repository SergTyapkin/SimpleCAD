import * as VueRouter from 'vue-router';
import Editor from '../views/Editor.vue';

const routes = [
  {
    path: '/',
    name: 'Editor',
    component: Editor
  }
];

const router = VueRouter.createRouter({
  history: VueRouter.createWebHistory(),
  routes
});

export default router;