<template>
  <q-card @keydown.enter.prevent="checkUser">
    <q-card-section class="q-pt-none">
      <q-input v-model="name" label="Имя пользователя" autofocus />
    </q-card-section>

    <q-card-section class="q-pt-none">
      <q-input v-model="password" type="password" label="Пароль" />
    </q-card-section>

    <q-card-section
      v-if="warning"
      class="text-negative text-subtitle1 row justify-center"
    >
      Неверно введены имя или пароль
    </q-card-section>

    <q-card-actions vertical class="text-primary">
      <q-btn flat label="Войти" @click="checkUser" />
      <q-btn flat label="Зарегистрироваться" @click="showRegister = true" />
    </q-card-actions>
    <RegisterWindow v-model="showRegister" />
  </q-card>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useUserStore } from 'src/stores/userStore';
import RegisterWindow from './RegisterWindow.vue';

const userStore = useUserStore();

const name = ref('');
const password = ref('');
const warning = ref(false);
const showRegister = ref(false);

async function checkUser() {
  userStore.login(name.value, password.value).then((x) => {
    console.log(x);
    warning.value = !x;
  });
}
</script>
