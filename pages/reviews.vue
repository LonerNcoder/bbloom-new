<template>
    <DmsEditor />
    <!-- <ReviewSection :instance-id="currentBookInstanceId" /> -->
  </template>
  
  <script setup>
import DmsEditor from '~/components/DmsEditor.vue';

  
  const currentBookInstanceId = ref('Novel_1');
  </script>