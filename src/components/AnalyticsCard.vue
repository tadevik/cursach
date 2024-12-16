<template>
  <q-card>
    <q-card-section>
      Всего пользователями было оценено {{ active_length }} записей
    </q-card-section>
    <q-card-section>
      Из {{ rating_length }} оценок положительными были
      {{ positive_rating_length }}. Процент положительных: {{ positive_rate }}%
      <br />
      <div v-if="positive_rate > 80" class="text-green">
        Это хороший результат!
      </div>
      <div v-else-if="positive_rate > 50" class="text-warning">
        Это неплохой результат
      </div>
      <div v-else-if="positive_rate > 0" class="text-red">
        Вам стоит лучше контролировать сотрудников
      </div>
      <div v-else>Пока не было оценено ни одной записи</div>
    </q-card-section>
    <q-card-section>
      Средние оценки критериев:
      <br />
      <div v-for="(i, key) in ratingsAvg" :key="key">
        {{ key }} - {{ ratingsAvg[key] }}
      </div>
    </q-card-section>
    <q-card-section v-if="weakRatings.length">
      Стоит обратить внимание на следующие критерии:
      <div v-for="i in weakRatings" :key="i">
        {{ i }}
      </div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { useRecordStore } from 'src/stores/recordStore';
import { useUserStore } from 'src/stores/userStore';
import { useParamStore } from 'src/stores/paramStore';
import { computed, onMounted, reactive } from 'vue';
const userStore = useUserStore();
const recordStore = useRecordStore();
const paramStore = useParamStore();

const ratingsAvg = reactive(<Record<string, number>>{});
onMounted(() => {
  for (let i in paramStore.params) {
    fetch('http://127.0.0.1:5000/get_avg/'.concat(i), {
      method: 'GET',
    })
      .then((res) => res.json())
      .then((res) => {
        ratingsAvg[paramStore.params[i].name] = Math.round(res['rate']);
      });
  }
});

const weakRatings = computed(() => {
  const arr = [];
  for (let i in Object.keys(ratingsAvg)) {
    if (ratingsAvg[i] <= 3) {
      arr.push(i);
    }
  }
  return arr;
});

const active_length = computed(() => {
  return userStore.archive.length;
});
const rating_length = computed(() => {
  let sum = 0;
  Object.values(recordStore.records).forEach((val) => {
    sum += Object.keys(val.rating).length;
  });
  return sum;
});

const positive_rating_length = computed(() => {
  let sum = 0;
  Object.values(recordStore.records).forEach((val) => {
    sum += Object.values(val.rating).filter((val) => {
      return val >= 3;
    }).length;
  });
  return sum;
});

const positive_rate = computed(() => {
  if (rating_length.value == 0) return 0;
  return Math.round((positive_rating_length.value / rating_length.value) * 100);
});
</script>
