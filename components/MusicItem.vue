<!-- MusicItem.vue -->
<template>
    <div class="music-item">
      <img :src="item.imageUrl" :alt="item.title" class="item-image" />
      <div class="item-details">
        <h3 class="item-title">{{ item.title }}</h3>
        <p class="item-subtitle">{{ item.subtitle }}</p>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    item: {
      type: Object,
      required: true,
    },
  })
  </script>
  
  <style scoped>
  .music-item {
    width: 200px; /* Adjust item width */
    border-radius: 8px;
    overflow: hidden;
    background-color: #fff; /* Optional: item background color */
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.08); /* Optional: item shadow */
  }
  
  .item-image {
    width: 100%;
    height: auto;
    display: block; /* Prevent extra space below image */
  }
  
  .item-details {
    padding: 15px;
  }
  
  .item-title {
    font-size: 16px;
    font-weight: 500;
    color: #333; /* Adjust title color */
    margin-bottom: 5px;
    white-space: nowrap;        /* Prevent text from wrapping */
    overflow: hidden;           /* Hide overflowing text */
    text-overflow: ellipsis;    /* Add ellipsis to overflowing text */
  }
  
  .item-subtitle {
    font-size: 12px;
    color: #777; /* Adjust subtitle color */
    white-space: nowrap;        /* Prevent text from wrapping */
    overflow: hidden;           /* Hide overflowing text */
    text-overflow: ellipsis;    /* Add ellipsis to overflowing text */
  }
  </style>