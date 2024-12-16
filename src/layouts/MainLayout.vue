<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-white text-black">
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <q-toolbar-title>Система контроля качества</q-toolbar-title>
        <q-space />
        <q-toolbar-title shrink class="q-mr-sm">
          <!--<profileButton v-if="currentUser" />-->
        </q-toolbar-title>
      </q-toolbar>
    </q-header>

    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :breakpoint="500"
      bordered
      :mini="miniState"
      @mouseover="miniState = false"
      @mouseout="miniState = true"
      dark
      class="bg-blue-grey-10"
    >
      <q-list>
        <q-item>
          <q-item-section avatar>
            <q-icon name="person" />
          </q-item-section>
          <q-item-section> {{ userStore.getCurrentUserName }} </q-item-section>
        </q-item>
        <q-separator />

        <q-item :to="'/user/' + userStore.currentUser">
          <q-item-section avatar>
            <q-icon name="mail" />
          </q-item-section>
          <q-item-section> Личный кабинет </q-item-section>
        </q-item>

        <q-item to="/">
          <q-item-section avatar>
            <q-icon name="phone" />
          </q-item-section>
          <q-item-section> Активные записи </q-item-section>
        </q-item>
        <q-item to="/archive">
          <q-item-section avatar>
            <q-icon name="book" />
          </q-item-section>
          <q-item-section> Архив </q-item-section>
        </q-item>

        <q-item to="/analytic" v-if="userStore.currentType === 0">
          <q-item-section avatar>
            <q-icon name="school" />
          </q-item-section>
          <q-item-section> Аналитика </q-item-section>
        </q-item>
        <q-separator />

        <q-item clickable @click="logout">
          <q-item-section avatar>
            <q-icon name="door_front" />
          </q-item-section>
          <q-item-section> Выйти </q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view class="bg-grey-1 row content-start" />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, reactive } from 'vue';
import { useUserStore } from 'src/stores/userStore';

const leftDrawerOpen = ref(false);
const miniState = ref(true);
miniState.value = false;
function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

const userStore = useUserStore();

/*const curType = computed(function () {
  return userStore.currentType;
});*/

function logout() {
  userStore.logout();
}
</script>
