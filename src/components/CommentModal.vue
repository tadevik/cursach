<template>
  <q-dialog @before-show="clearComment()" ref="commentDialog">
    <q-card style="min-width: 500px">
      <q-card-section class="q-pb-none text-h6">
        Добавить комментарий
      </q-card-section>
      <q-card-section>
        <q-form>
          <q-input
            v-model="curComment.comment"
            borderless
            label="Комментарий"
          />
          <q-select
            v-model="curComment.type"
            :options="options"
            emit-value
            map-options
            label="Тип комментария"
          />
        </q-form>
      </q-card-section>
      <q-card-actions>
        <q-btn color="secondary" @click="addComment()">Добавить</q-btn>
        <q-btn color="grey-2" class="text-black" @click="cancelComment()">
          Отмена
        </q-btn>
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref } from 'vue';

import { useRecordStore } from 'src/stores/recordStore';
import { useUserStore } from 'src/stores/userStore';
import { Comment, User } from './models';

const userStore = useUserStore();
const recordStore = useRecordStore();

const commentDialog = ref();
const curComment = ref(<Comment>{});

const props = defineProps({
  id: {
    type: Number,
    required: true,
  },
  time: {
    type: Number,
    required: true,
  },
});

function clearComment() {
  curComment.value = {
    id: 0,
    author: (userStore.currentUserObj as User).worker,
    comment: '',
    type: 'grey-2',
    time: props.time,
    date: new Date().toLocaleString().slice(0, 20).replace('T', ' '),
  };
}

const options = [
  {
    label: 'Положительный',
    value: 'green-1',
  },
  {
    label: 'Нейтральный',
    value: 'grey-2',
  },
  {
    label: 'Предупреждение',
    value: 'orange-1',
  },
];

function addComment() {
  recordStore.newComment(props.id, curComment.value);
  commentDialog.value.hide();
}
function cancelComment() {
  commentDialog.value.hide();
}
</script>
