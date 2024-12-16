<template>
  <q-dialog>
    <q-card style="width: 800px; height: 600px">
      <q-card-section class="text-h6">Регистрация</q-card-section>
      <q-card-section>
        <q-form @submit="onSubmit()">
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
          <q-select
            v-model="curUser.worker"
            :options="options"
            emit-value
            map-options
            class="q-mb-sm"
          >
            <template v-slot:after>
              <q-btn
                flat
                label="Новый работник"
                @click="newWorkerShow = true"
              />
            </template>
          </q-select>

          <div>
            <q-btn
              label="Зарегистрироваться"
              type="submit"
              color="primary"
              flat
            />
          </div>
        </q-form>
      </q-card-section>
    </q-card>
    <q-dialog v-model="newWorkerShow">
      <q-card>
        <q-card-section> Создать нового работника </q-card-section>
        <q-card-section>
          <q-form @submit="onWorkerSubmit()">
            <q-input v-model="curWorker.name" label="Ф.И.О." />
            <q-input v-model="curWorker.role" label="Должность" />
            <q-select
              v-model="curWorker.depart"
              label="Отдел"
              :options="departOptions"
              map-options
              emit-value
            />
            <div>
              <q-btn label="Добавить" type="submit" color="primary" />
            </div>
          </q-form>
        </q-card-section>
      </q-card>
    </q-dialog>
  </q-dialog>
</template>

<script setup lang="ts">
import { reactive, ref, watch } from 'vue';
import { User, Worker } from './models';

import { useWorkerStore } from 'src/stores/workerStore';
import { useUserStore } from 'src/stores/userStore';
import { useDepartStore } from 'src/stores/departStore';
import { QSelectOption } from 'quasar';

const workerStore = useWorkerStore();
const userStore = useUserStore();
const departStore = useDepartStore();

const curUser = reactive(<User>{
  id: 0,
  name: '',
  password: '',
  worker: 0,
  type: 1,
});

const curWorker = reactive(<Worker>{
  id: 0,
  name: '',
  role: '',
  depart: 0,
});

const curpass = ref('');

const options = reactive(<QSelectOption[]>[]);
watch(
  () => workerStore.isLoaded,
  () => {
    Object.values(workerStore.workers).forEach((val) => {
      options.push({
        label: val.name,
        value: String(val.id),
      });
    });
  }
);

const departOptions = <QSelectOption[]>[];
Object.values(departStore.departs).forEach((val) => {
  departOptions.push({
    label: val.name,
    value: String(val.id),
  });
});
function onSubmit() {
  userStore.register(curUser);
}
async function onWorkerSubmit() {
  workerStore.createNewWorker(curWorker).then((res) => {
    curWorker.id = res;
    if (curWorker.id == -1) {
      curWorker.id = 0;
      return;
    }
    options.push({ value: String(curWorker.id), label: curWorker.name });
  });
}

const newWorkerShow = ref(false);
</script>
