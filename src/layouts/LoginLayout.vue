<template>
  <q-layout view="lHh Lpr lFf">
    <q-header class="bg-white text-black">
      <q-toolbar>
        <q-toolbar-title>Система контроля качества</q-toolbar-title>
        <q-space />
        <q-toolbar-title shrink class="q-mr-sm"> </q-toolbar-title>
      </q-toolbar>
    </q-header>
    <q-page-container>
      <router-view class="bg-grey-1" />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts"></script>
