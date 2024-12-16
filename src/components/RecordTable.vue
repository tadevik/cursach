<template>
  <q-table
    title="Активные записи"
    :columns="recordListColumns"
    :rows="records"
    v-if="records.length && isRecordLoaded"
    @row-dblclick="
      (event, row) => {
        curid = row.id;
        recordModalKey = true;
      }
    "
    :key="tableKey"
    hide-bottom
    square
    virtual-scroll
    v-model:pagination="pagination"
    :rows-per-page-options="[0]"
    :filter="filter"
  >
    <template v-slot:top-right>
      <q-input
        borderless
        dense
        debounce="300"
        v-model="filter"
        placeholder="Поиск"
      >
        <template v-slot:append>
          <q-icon name="search" />
        </template>
      </q-input>
    </template>
    <template v-slot:body-cell-action="props" v-if="props.active">
      <q-td :props="props">
        <q-btn flat dense @click="sendRating(props.row)"> Отправить </q-btn>
      </q-td>
    </template>
  </q-table>
  <div v-else>На данный момент записи отсутствуют</div>
  <RecordModal v-model="recordModalKey" :id="curid" :active="props.active" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { QTableColumn, useQuasar } from 'quasar';

import { useRecordStore } from 'src/stores/recordStore';
import { Recording } from './models';
import RecordModal from './RecordModal.vue';
import { useUserStore } from 'src/stores/userStore';

const $q = useQuasar();
const recordStore = useRecordStore();
const userStore = useUserStore();

const isRecordLoaded = computed(() => recordStore.isLoaded);

const props = defineProps({
  active: {
    type: Boolean,
    required: true,
  },
});
const tableKey = ref(0);
const records = computed(() => {
  tableKey.value;
  isRecordLoaded.value;
  return <Recording[]>(
    Object.values(
      recordStore.getRecordsByList(userStore.getUserActive(props.active))
    )
  );
});
const recordModalKey = ref(false);
const curid = ref(0);

const filter = ref('');

const recordListColumns: QTableColumn<Recording>[] = [
  {
    name: 'id',
    label: 'Id',
    field: 'id',
    align: 'left',
    headerStyle: 'display: none',
    style: 'display: none',
  },
  {
    name: 'number',
    label: 'Номер абонента',
    field: 'cust_num',
    align: 'left',
    sortable: true,
    style: 'width: 40%;',
  },
  {
    name: 'time',
    label: 'Время вызова',
    field: 'time',
    align: 'left',
    sortable: true,
    style: 'width: 30%;',
  },
  {
    name: 'length',
    label: 'Длина вызова',
    field: 'length',
    align: 'left',
    sortable: true,
    style: 'width: 20%;',
  },
  {
    name: 'action',
    label: 'Действие',
    field: 'type',
    align: 'center',
    style: 'width: 10%',
  },
];
const pagination = ref({
  rowsPerPage: 0,
});

// eslint-disable-next-line  @typescript-eslint/no-explicit-any
function sendRating(row: any) {
  if (
    records.value[
      records.value.findIndex((val) => val.id == (row.id as number))
    ].rating == undefined ||
    Object.keys(
      records.value[
        records.value.findIndex((val) => val.id == (row.id as number))
      ].rating
    ).length == 0
  ) {
    $q.dialog({
      title: 'Архивирование',
      message: 'Запись не оценена!',
      ok: {
        label: 'Печально',
        flat: true,
        color: 'red',
      },
    });
    return;
  }
  $q.dialog({
    title: 'Архивирование',
    message: 'Действительно отправить запись в архив?',
    ok: {
      label: 'Да',
      flat: true,
    },
    cancel: {
      label: 'Отмена',
      flat: true,
      color: 'grey',
    },
  }).onOk(() => {
    recordStore.sendRating(row.id);
    tableKey.value++;
  });
}
</script>
