<template>
  <q-card class="col-12">
    <q-card-section class="row">
      <div class="col text-h6 q-pb-none q-mb-none">Действия</div>
      <div align="right" class="col">
        <q-btn label="Распределить записи" @click="distributeRecords()" />
        <q-btn label="Добавить запись" @click="recordModal = true" />
      </div>
    </q-card-section>
    <q-card-section>
      <q-expansion-item
        flat
        v-model="departExp"
        label="Подразделения"
        class="bg-blue-grey-5 text-white"
      >
        <q-list class="bg-white text-black">
          <q-item
            v-for="i in Object.values(departs)"
            clickable
            :key="i.id"
            @click="openDepartModal(i)"
          >
            {{ i.name }}
          </q-item>
          <q-item clickable @click="openDepartModal({ id: -1, name: '' })">
            Новое подразделение
          </q-item>
        </q-list>
      </q-expansion-item>
      <q-expansion-item
        v-model="userExp"
        label="Пользователи"
        class="bg-blue-grey-5 text-white"
      >
        <q-list class="bg-white text-black">
          <q-item
            v-for="user in users"
            :key="user.id"
            clickable
            @click="openUserModal(user)"
          >
            {{ user.name }}
          </q-item>
        </q-list>
      </q-expansion-item>
      <q-expansion-item
        v-model="workerExp"
        label="Работники"
        class="bg-blue-grey-5 text-white"
      >
        <q-list class="bg-white text-black">
          <q-item
            v-for="worker in workers"
            :key="worker.id"
            clickable
            @click="openWorkerModal(worker)"
          >
            {{ worker.name }}
          </q-item>
          <q-item
            clickable
            @click="openWorkerModal({ id: -1, name: '', role: '', depart: 0 })"
          >
            Новый работник
          </q-item>
        </q-list>
      </q-expansion-item>
      <q-expansion-item
        v-model="paramExp"
        label="Параметры"
        class="bg-blue-grey-5 text-white"
      >
        <q-list class="bg-white text-black">
          <q-item
            v-for="param in params"
            :key="param.id"
            clickable
            @click="openParamModal(param)"
          >
            {{ param.name }}
          </q-item>
          <q-item
            clickable
            @click="openParamModal({ id: -1, name: '', weight: 0, type: 0 })"
          >
            Новый параметр
          </q-item>
        </q-list>
      </q-expansion-item>
    </q-card-section>
    <q-dialog v-model="departModal">
      <q-card style="min-width: 60vw">
        <q-card-section class="text-h6">
          Изменить подразделение
        </q-card-section>
        <q-card-section>
          <q-input label="Название" v-model="curDepart.name" />
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            label="Изменить"
            flat
            color="green"
            v-close-popup
            @click="setDepart()"
          />
          <q-btn label="Отмена" flat color="gray-3" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="userModal">
      <q-card style="min-width: 60vw">
        <q-card-section class="text-h6"> Изменить пользователя </q-card-section>
        <q-card-section>
          <q-form>
            <q-input label="Имя пользователя" v-model="curUser.name" />
            <q-input label="Пароль" v-model="curUser.password" />
            <q-select
              v-model="curWorkerOption"
              label="Подразделение"
              :options="workerOptions"
              map-options
              emit-value
            />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            label="Изменить"
            flat
            color="green"
            v-close-popup
            @click="setUser()"
          />
          <q-btn label="Отмена" flat color="gray-3" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="workerModal">
      <q-card style="min-width: 60vw">
        <q-card-section class="text-h6"> Изменить работника </q-card-section>
        <q-card-section>
          <q-form>
            <q-input label="Имя" v-model="curWorker.name" />
            <q-input label="Роль" v-model="curWorker.role" />
            <q-select
              v-model="curDepartOption"
              label="Подразделение"
              :options="departOptions"
              map-options
              emit-value
            />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            label="Изменить"
            flat
            color="green"
            v-close-popup
            @click="setWorker()"
          />
          <q-btn label="Отмена" flat color="gray-3" v-close-popup />
          <q-btn label="Удалить" flat color="red-3" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <q-dialog v-model="paramModal">
      <q-card style="min-width: 60vw">
        <q-card-section class="text-h6"> Изменить параметр </q-card-section>
        <q-card-section>
          <q-form>
            <q-input label="Название" v-model="curParam.name" />
            <q-input
              label="Вес"
              v-model.number="curParam.weight"
              type="number"
            />
            <q-select
              :options="paramOptions"
              v-model="curParamType"
              emit-value
              map-options
            />
          </q-form>
        </q-card-section>
        <q-card-actions align="right">
          <q-btn
            label="Изменить"
            flat
            color="green"
            v-close-popup
            @click="setParam()"
          />
          <q-btn label="Отмена" flat color="gray-3" v-close-popup />
        </q-card-actions>
      </q-card>
    </q-dialog>
    <new-record-modal v-model="recordModal" />
  </q-card>
</template>

<script setup lang="ts">
import { ref, computed, reactive } from 'vue';
import { QSelectOption } from 'quasar';

import { useDepartStore } from 'src/stores/departStore';
import { useUserStore } from 'src/stores/userStore';
import { useWorkerStore } from 'src/stores/workerStore';
import { useParamStore } from 'src/stores/paramStore';
import { Depart, User, Worker, Param } from './models';
import NewRecordModal from './NewRecordModal.vue';

const departExp = ref(false);
const departModal = ref(false);
const userExp = ref(false);
const userModal = ref(false);
const userKey = ref(0);
const departKey = ref(0);
const workerExp = ref(false);
const workerModal = ref(false);
const workerKey = ref(0);
const paramKey = ref(0);
const paramExp = ref(false);
const paramModal = ref(false);
const recordModal = ref(false);

const departStore = useDepartStore();
let curDepart = reactive(<Depart>{
  id: 0,
  name: '',
});

const userStore = useUserStore();
let curUser = reactive(<User>{
  id: 0,
  name: '',
  password: '',
  worker: 0,
  type: 1,
});
const curWorkerOption = computed({
  get() {
    userKey.value;
    return curUser.worker.toString();
  },
  set(newVal) {
    curUser.worker = Number(newVal);
  },
});

const workerStore = useWorkerStore();
let curWorker = reactive(<Worker>{
  id: 0,
  name: '',
  role: '',
  depart: 0,
});
const workers = computed(() => workerStore.workers);

const workerOptions = computed(() => {
  const obj = <QSelectOption[]>[];
  Object.values(workers.value).forEach((val) => {
    obj.push({ label: val.name, value: val.id.toString() });
  });
  return <QSelectOption[]>obj;
});

const departs = computed(() => {
  return departStore.departs;
});

const departOptions = computed(() => {
  const obj = <QSelectOption[]>[];
  Object.values(departs.value).forEach((val) => {
    obj.push({ label: val.name, value: val.id.toString() });
  });
  return <QSelectOption[]>obj;
});
const curDepartOption = computed({
  get() {
    workerKey.value;
    return curWorker.depart.toString();
  },
  set(newVal) {
    curWorker.depart = Number(newVal);
  },
});

const users = computed(() => {
  return userStore.users;
});

const paramStore = useParamStore();
const params = computed(() => {
  return paramStore.params;
});
const paramOptions = <QSelectOption[]>[
  { label: 'Общий', value: '0' },
  { label: 'Входящий', value: '1' },
  { label: 'Исходящий', value: '2' },
];
let curParam = <Param>{};

function openDepartModal(val: Depart) {
  departModal.value = true;
  curDepart = JSON.parse(JSON.stringify(val));
}
async function setDepart() {
  if (curDepart.id === -1) {
    departStore.createDepart(curDepart).then((val) => {
      curDepart.id = val;
    });
  } else {
    departStore.setDepart(curDepart);
  }
  departKey.value++;
}

function openUserModal(val: User) {
  userModal.value = true;
  userKey.value++;
  curUser = val;
}
function setUser() {
  userStore.setUser(curUser);
  userKey.value++;
}

function openWorkerModal(val: Worker) {
  workerModal.value = true;
  workerKey.value++;
  curWorker = JSON.parse(JSON.stringify(val));
}
function setWorker() {
  if (curDepart.id === -1) {
    workerStore.createNewWorker(curWorker).then((val) => {
      curWorker.id = val;
    });
  } else {
    workerStore.setWorker(curWorker);
  }
  workerKey.value++;
}

const curParamType = computed({
  get() {
    paramKey.value;
    return curParam.type.toString();
  },
  set(newVal) {
    curParam.type = Number(newVal);
  },
});

function openParamModal(val: Param) {
  paramModal.value = true;
  paramKey.value++;
  curParam = JSON.parse(JSON.stringify(val));
}
function setParam() {
  if (curParam.id === -1) {
    paramStore.createNewParam(curParam).then((val) => {
      curParam.id = val;
    });
  } else {
    paramStore.setParam(curParam);
  }
  paramKey.value++;
}

function distributeRecords() {
  fetch('http://127.0.0.1:5000/distribute', {
    method: 'GET',
  }).then(() => {
    alert('Записи успешно распределены!');
    //window.location.reload();
  });
}
</script>
