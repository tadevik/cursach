<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from 'vue';

import { useWorkerStore } from './stores/workerStore';
import { useDepartStore } from './stores/departStore';
import { useParamStore } from './stores/paramStore';
import { useUserStore } from './stores/userStore';

const userStore = useUserStore();
const workerStore = useWorkerStore();
const departStore = useDepartStore();
const paramStore = useParamStore();

onMounted(() => {
  const user = document.cookie
    .split('; ')
    .find((row) => row.startsWith('user='))
    ?.split('=')[1];
  const pass = document.cookie
    .split('; ')
    .find((row) => row.startsWith('pass='))
    ?.split('=')[1];
  workerStore.getWorkers();
  departStore.getDeparts();
  paramStore.getParams();
  if (pass !== undefined && user != undefined) {
    userStore.login(user, pass);
  }
});
</script>
