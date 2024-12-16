<template>
  <q-table
    title="Архивные записи"
    :columns="recordListColumns"
    :rows="records"
    v-if="records.length"
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
  </q-table>
  <div v-else>На данный момент записи отсутствуют</div>
  <RecordModal v-model="recordModalKey" :id="curid" :active="props.active" />
</template>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { QTableColumn } from 'quasar';

import { useRecordStore } from 'src/stores/recordStore';
import { Recording } from './models';
import RecordModal from './RecordModal.vue';
import { useUserStore } from 'src/stores/userStore';

const recordStore = useRecordStore();
const userStore = useUserStore();
const filter = ref('');

const props = defineProps({
  active: {
    type: Boolean,
    required: true,
  },
});
let records = computed(() => {
  tableKey.value;
  return <Recording[]>(
    Object.values(
      recordStore.getRecordsByList(userStore.getUserActive(props.active))
    )
  );
});
const recordModalKey = ref(false);
const curid = ref(0);
const tableKey = ref(0);

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
    sortable: true,
    field: 'cust_num',
    align: 'left',
    style: 'width: 40%;',
  },
  {
    name: 'time',
    label: 'Время вызова',
    sortable: true,
    field: 'time',
    align: 'left',
    style: 'width: 30%;',
  },
  {
    name: 'length',
    label: 'Длина вызова',
    sortable: true,
    field: 'length',
    align: 'left',
    style: 'width: 30%;',
  },
];
const pagination = ref({
  rowsPerPage: 0,
});
</script>
