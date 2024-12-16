<template>
  <q-dialog
    full-height
    full-width
    @before-show="getRecording()"
    @before-hide="hideWindow()"
  >
    <q-card class="row">
      <q-card-section class="col-8 column content-start no-wrap">
        <q-card class="col-3 q-mb-sm column" style="height: 125px; width: 100%">
          <q-card-section class="col-3 column q-mb-sm">
            <div class="col row text-caption">
              <div class="col column">
                <div class="col-4" v-if="recordWorker !== undefined">
                  {{ recordWorker.name }} ({{ recordWorker.role }})
                </div>
              </div>
              <div class="col-3">Дата: {{ recording.time }}</div>
              <div class="col-2">Тип: {{ recordType }}</div>
              <div class="col-3">Номер: {{ recording.cust_num }}</div>
            </div>
          </q-card-section>
          <q-card-section class="col">
            <AudioPlayer
              :file="recording.record"
              style="width: 100%"
              ref="player"
            />
          </q-card-section>
        </q-card>
        <CommentCard
          v-for="comment in recording.comments"
          :key="comment.id"
          :comment="comment"
          :record_id="props.id"
          :active="isRatingActive"
          @change-time="(time) => changeTime(time)"
          @delete-comment="(comment_id) => deleteComment(comment_id)"
          class="col q-mb-sm"
        />
        <q-btn
          class="col-1 self-center"
          style="width: 300px; height: 40px"
          v-if="isRatingActive"
          @click="addComment()"
        >
          Добавить комментарий
        </q-btn>
      </q-card-section>
      <q-card-section class="col-4 column">
        <q-btn
          v-if="props.active || userStore.currentType === 0"
          @click="setRating()"
          class="col col-auto q-mb-sm"
          color="primary"
        >
          {{ ratingTitle }}
        </q-btn>
        <div v-if="warning" class="text-negative q-pb-sm">
          Оцените все критерии!
        </div>
        <q-card class="col q-mb-sm" style="max-height: 50px">
          <q-card-section class="q-pt-xs q-pb-none">
            <div class="text-subtitle1">
              Итоговая оценка: {{ getAvgRating() }}%
            </div>
          </q-card-section>
        </q-card>
        <div class="col row content-start">
          <q-card
            v-for="(rating, key) in ratings"
            :key="key"
            class="col-12 q-mb-xs"
            style="height: 90px"
          >
            <q-card-section>{{ getParamName(key) }}</q-card-section>
            <q-card-section class="q-pt-none">
              <q-rating
                v-model="ratings[key]"
                size="1.5em"
                :disable="!isRatingActive"
              />
            </q-card-section>
          </q-card>
        </div>
      </q-card-section>
      <q-card-actions class="col-12">
        <q-btn
          label="Удалить запись"
          v-if="userStore.currentType === 0"
          flat
          color="red"
          @click="deleteRecord()"
        />
      </q-card-actions>
    </q-card>
    <CommentModal v-model="showComment" :id="props.id" :time="curtime" />
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, reactive, computed } from 'vue';

import { useParamStore } from 'src/stores/paramStore';
import { useRecordStore } from 'src/stores/recordStore';
import { useUserStore } from 'src/stores/userStore';
import { Recording, Params } from './models';
import AudioPlayer from './AudioPlayer.vue';
import CommentModal from './CommentModal.vue';
import CommentCard from './CommentCard.vue';

const props = defineProps({
  id: { type: Number, required: true },
  active: { type: Boolean, required: true },
});

const paramStore = useParamStore();
const recordStore = useRecordStore();
const userStore = useUserStore();
const player = ref();
const showComment = ref(false);
const curtime = ref(0);
function GetAudioTime() {
  curtime.value = player.value.getTimeInSeconds();
}

const isRatingActive = ref(false);
const ratingTitle = computed(() => {
  return isRatingActive.value ? 'Сохранить изменения' : 'Редактировать оценку';
});

function recordKeys<K extends PropertyKey, T>(object: Record<K, T>) {
  return Object.keys(object) as K[];
}

let recording = <Recording>{};
let ratings = reactive(<Record<number, number>>{});
let params = reactive<Params>(paramStore.getParamsByType(recording.type));
function getRecording() {
  recording = recordStore.getRecordById(props.id);
  params = reactive<Params>(paramStore.getParamsByType(recording.type));
  ratings = reactive(<Record<number, number>>{});
  recordKeys(params).forEach((param) => {
    ratings[param as number] = 0;
  });
  getRating();
}
function getRating() {
  if (!recordStore.ifRatingExists(props.id)) {
    return;
  }
  let new_ratings = recordStore.getRating(props.id);
  Object.keys(new_ratings as Record<number, number>).forEach((val) => {
    ratings[Number(val)] = (new_ratings as Record<number, number>)[Number(val)];
  });
}

function changeTime(time: number) {
  player.value.changeTime(time);
}
function deleteComment(comment_id: number) {
  recording.comments?.splice(
    recording.comments?.findIndex((val) => val.id === comment_id),
    1
  );
  recordStore.deleteComment(props.id, comment_id);
}

const recordWorker = computed(() => {
  return recordStore.getRecordWorker(props.id);
});
const recordType = computed(() => {
  return recording.type === 1 ? 'Исходящий' : 'Входящий';
});

function getParamName(id: number) {
  return params[id].name;
}

function getAvgRating() {
  let sum = 0;
  let maxSum = 0;
  for (let i of recordKeys(params)) {
    if (ratings[i] === undefined || ratings[i] === 0) {
      continue;
    }
    sum += ratings[i] * params[i].weight;
    maxSum += 5 * params[i].weight;
  }
  return sum == 0 ? 0 : +((sum / maxSum) * 100).toFixed(0);
}

const warning = ref(false);
function setRating() {
  if (isRatingActive.value) {
    if (Object.values(ratings).find((el) => el == 0) !== undefined) {
      warning.value = true;
      return;
    }
    recordStore.setRating(props.id, ratings);
  }
  warning.value = false;
  isRatingActive.value = !isRatingActive.value;
}

function addComment() {
  GetAudioTime();
  showComment.value = true;
}

function deleteRecord() {
  recordStore.deleteRecord(props.id);
}

function hideWindow() {
  player.value.stopPlaying();
}
</script>
