<template>
  <q-page class="row items-center justify-evenly">
    <div class="col-12 q-mt-md q-mb-md">
      <div class="text-h4 col-12 q-ml-md">Архив</div>
    </div>
    <RecordList :active="false" />
  </q-page>
</template>

<script setup lang="ts">
import RecordList from 'components/RecordList.vue';
</script>
