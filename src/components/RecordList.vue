<template>
  <q-card style="width: 100vw" class="bg-grey-1 col-12">
    <q-card-section>
      <RecordTable :active="props.active" v-if="props.active" />
      <ArchiveTable :active="props.active" v-else />
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import ArchiveTable from './ArchiveTable.vue';
import RecordTable from './RecordTable.vue';

const props = defineProps({
  active: {
    type: Boolean,
    required: true,
  },
});
</script>
