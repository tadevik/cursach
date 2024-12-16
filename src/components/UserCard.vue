<template>
  <q-card flat class="row">
    <q-card-section v-if="userStore.currentType === 1" class="col-12">
      <div>
        Вы провели оценку записей в количестве
        {{ totalRated }}
        штук. Продолжайте в том же духе!
      </div>
    </q-card-section>
    <q-card-section v-else class="col-12 row">
      <AdminPanel />
    </q-card-section>
    <q-card-section>
      <q-btn
        color="primary"
        label="Изменить данные пользователя"
        no-caps
        @click="modalUser = true"
      />
    </q-card-section>
    <q-dialog v-model="modalUser">
      <q-card>
        <q-card-section>Изменить личные данные</q-card-section>
        <q-card-section>
          <q-form @submit="sendUser()">
            <q-input v-model="curUser.name" label="Имя пользователя" />
            <q-input v-model="curUser.password" label="Пароль" />
            <q-input
              v-model="curpass"
              lazy-rules
              :rules="[
                (val) => val === curUser.password || 'Пароли не совпадают!',
              ]"
              label="Подтвердите пароль"
            />
            <q-btn
              flat
              color="info"
              label="Сохранить изменения"
              type="submit"
            />
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-card>
</template>

<script setup lang="ts">
import { useUserStore } from 'src/stores/userStore';
import { User } from './models';
import AdminPanel from './AdminPanel.vue';
import { ref, computed } from 'vue';

const userStore = useUserStore();
const totalRated = computed(() => {
  return userStore.archive != undefined ? userStore.archive.length : 0;
});

const modalUser = ref(false);
const curpass = ref('');
const curUser = userStore.currentUserObj as User;

function sendUser() {
  userStore.setUser(curUser);
}
</script>
