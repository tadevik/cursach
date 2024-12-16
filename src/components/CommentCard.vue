<template>
  <q-card class="col-3" :class="'bg-' + props.comment.type">
    <q-card-section class="column">
      <div class="col-2 row text-caption">
        <div class="col-4">{{ commentAuthorName }}</div>
        <div class="col-3">Дата: {{ props.comment.date }}</div>
        <div class="col-2">
          Время:
          <a href="#" @click="changeTime()">
            {{ getTimeFromSeconds(props.comment.time) }}
          </a>
        </div>
        <div class="col" style="text-align: right" v-if="props.active">
          <q-btn dense flat icon="edit" size="sm" @click="changeComment()" />
          <q-btn dense flat icon="delete" size="sm" @click="deleteComment()" />
        </div>
      </div>
      <div class="col" style="white-space: normal; word-break: break-all">
        <div v-if="!isBeingChanged">{{ props.comment.comment }}</div>
        <div v-else>
          <q-input label="Изменить комментарий" v-model="curComment">
            <template v-slot:append>
              <q-btn @click="setComment()" flat>Подтвердить</q-btn>
            </template>
          </q-input>
        </div>
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import type { PropType } from 'vue';
import { ref, computed } from 'vue';
import { useQuasar } from 'quasar';

import { useWorkerStore } from 'src/stores/workerStore';
import { useRecordStore } from 'src/stores/recordStore';
import { getTimeFromSeconds, Comment } from './models';

const workerStore = useWorkerStore();
const recordStore = useRecordStore();
const $q = useQuasar();

const props = defineProps({
  comment: {
    type: Object as PropType<Comment>,
    required: true,
  },
  record_id: {
    type: Number,
    required: true,
  },
  active: {
    type: Boolean,
    required: true,
  },
});
const emit = defineEmits<{
  (e: 'changeTime', time: number): void;
  (e: 'deleteComment', id: number): void;
}>();

const commentAuthorName = computed(() => {
  return workerStore.getWorkerById(props.comment.author).name;
});

function changeTime() {
  emit('changeTime', props.comment.time);
}

const isBeingChanged = ref(false);
const curComment = ref('');
function changeComment() {
  curComment.value = props.comment.comment;
  isBeingChanged.value = !isBeingChanged.value;
}
function setComment() {
  recordStore.setCommentText(
    props.record_id,
    props.comment.id,
    curComment.value
  );
  curComment.value = '';
  isBeingChanged.value = false;
}

function deleteComment() {
  $q.dialog({
    title: 'Удаление',
    message: 'Действительно удалить комментарий?',
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
    emit('deleteComment', props.comment.id);
  });
}
</script>
