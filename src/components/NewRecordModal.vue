<template>
  <q-dialog>
    <q-card style="min-width: 60vw">
      <q-card-section class="text-h6"> Новая запись </q-card-section>
      <q-card-section>
        <q-form>
          <q-file
            outlined
            v-model="file"
            label="Запись"
            @update:model-value="curRecord.record = file ? file.name : ''"
            accept="audio/*"
            :rules="[(val) => !!val || 'Заполните поле!']"
          >
          </q-file>
          <q-input
            v-model="curRecord.cust_num"
            label="Номер клиента"
            :rules="[
              (val) => !!val || 'Заполните поле!',
              (val) => isPhoneValid.test(val) || 'Неверный номер телефона!',
            ]"
          />

          <q-select
            v-model="curRecordType"
            :options="paramOptions"
            emit-value
            map-options
            :rules="[(val) => !!val || 'Заполните поле!']"
            label="Тип вызова"
          />

          <q-select
            v-model="curWorkerOption"
            :options="workerOptions"
            emit-value
            map-options
            :rules="[(val) => !!val || 'Заполните поле!']"
            label="Работник"
          />
        </q-form>
      </q-card-section>
      <q-card-actions align="right">
        <q-btn
          label="Добавить"
          flat
          color="green"
          @click="sendRecord()"
          v-close-popup
        />
        <q-btn label="Отмена" flat color="gray-3" v-close-popup />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { reactive, computed, ref } from 'vue';
import { QSelectOption } from 'quasar';

import { Recording } from './models';
import { useRecordStore } from 'src/stores/recordStore';
import { useWorkerStore } from 'src/stores/workerStore';
const workerStore = useWorkerStore();

const file = ref<File>();
const isPhoneValid = /(^((\+)[0-9]{10,12}$|^(?!(\+))[0-9]+)$|^$)/;
const curRecord = reactive(<Recording>{
  id: 0,
  record: '',
  cust_num: '',
  worker_id: 0,
  time: new Date().toLocaleString().slice(0, 20).replace('T', ' '),
  length: '',
  status: 0,
  type: 1,
  rating: {},
  comments: [],
});

const curWorkerOption = computed({
  get() {
    return curRecord.worker_id.toString();
  },
  set(newVal) {
    curRecord.worker_id = Number(newVal);
  },
});

const workers = computed(() => workerStore.workers);
const workerOptions = computed(() => {
  const obj = <QSelectOption[]>[];
  Object.values(workers.value).forEach((val) => {
    obj.push({ label: val.name, value: val.id.toString() });
  });
  return <QSelectOption[]>obj;
});

const paramOptions = <QSelectOption[]>[
  { label: 'Входящий', value: '1' },
  { label: 'Исходящий', value: '2' },
];

const curRecordType = computed({
  get() {
    return curRecord.type.toString();
  },
  set(newVal) {
    curRecord.type = Number(newVal);
  },
});

async function sendRecord() {
  console.log(file.value);
  const data = new FormData();
  if (file.value === undefined) return;
  data.append('file', file.value);
  fetch('http://127.0.0.1:5000/upload', {
    method: 'POST',
    body: data,
  })
    .then((res) => res.json())
    .then((res) => console.log(res));
  fetch('http://127.0.0.1:5000/record', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json;charset=utf-8',
    },
    body: JSON.stringify(curRecord),
  })
    .then((val) => val.json())
    .then((res) => {
      if (res.status) {
        curRecord.id = res.id;
        useRecordStore().records[res.id] = curRecord;
      }
    });
}
</script>
