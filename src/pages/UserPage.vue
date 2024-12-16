<template>
  <UserCard />
</template>

<script setup lang="ts">
import { onBeforeRouteUpdate } from 'vue-router';

import UserCard from 'src/components/UserCard.vue';
import { useUserStore } from 'src/stores/userStore';
const userStore = useUserStore();

onBeforeRouteUpdate((to) => {
  if (String(userStore.currentUser as number) !== to.params.id) return false;
  return true;
});
</script>
