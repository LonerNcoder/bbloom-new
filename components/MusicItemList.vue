<!-- MusicItemList.vue -->
<template>
    <div class="music-item-list">
      <MusicItem v-for="item in items" :key="item.title" :item="item" />
    </div>
  </template>
  
  <script setup>
  defineProps({
    items: {
      type: Array,
      required: true,
    },
  })
  </script>
  
  <style scoped>
  .music-item-list {
    display: flex;
    gap: 20px;
    overflow-x: auto; /* Horizontal scroll */
    padding-bottom: 15px; /* Space for scrollbar */
    -webkit-overflow-scrolling: touch; /* For smooth scrolling on iOS */
  }
  
  /* Hide scrollbar but keep functionality */
  .music-item-list::-webkit-scrollbar {
      width: 0px;  /* for vertical scrollbars */
      height: 0px; /* for horizontal scrollbars */
      background: transparent;  /* Optional: just make scrollbar invisible */
  }
  
  .music-item-list {
      scrollbar-width: none; /* Firefox */
      -ms-overflow-style: none;  /* IE 10+ */
  }
  </style>