import { RouteRecordRaw } from 'vue-router';
import { useUserStore } from 'src/stores/userStore';

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: () => import('layouts/MainLayout.vue'),
    children: [{ path: '', component: () => import('pages/IndexPage.vue') }],
  },
  {
    path: '/archive',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'acrhive',
        component: () => import('pages/ArchivePage.vue'),
      },
    ],
  },

  {
    path: '/analytic',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'analytic',
        component: () => import('pages/AnaliticsPage.vue'),
      },
    ],
  },
  {
    path: '/user/:id',
    component: () => import('layouts/MainLayout.vue'),
    children: [
      {
        path: '',
        name: 'user',
        component: () => import('pages/UserPage.vue'),
      },
    ],
    beforeEnter: (to) => {
      const userStore = useUserStore();
      if (String(userStore.currentUser as number) !== to.params.id)
        return false;
      return true;
    },
  },

  {
    path: '/login',
    component: () => import('layouts/LoginLayout.vue'),
    children: [
      {
        path: '',
        name: 'login',
        component: () => import('pages/LoginPage.vue'),
      },
    ],
    beforeEnter: () => {
      const userStore = useUserStore();
      if (userStore.currentUser !== undefined) return false;
      return true;
    },
  },
  // Always leave this as last one,
  // but you can also remove it
  {
    path: '/:catchAll(.*)*',
    component: () => import('pages/ErrorNotFound.vue'),
  },
];

export default routes;
