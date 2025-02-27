<template>
    <div
      class="rounded-lg shadow p-4"
      :style="{
        backgroundColor: readerStore[$colorMode.value].backgroundColor,
        filter: `brightness(${readerStore.brightness}%)`,
      }"
    >
      <div v-if="loading" class="animate-pulse p-4">
        <div class="h-8 bg-gray-300 opacity-50 rounded w-1/3 mb-10"></div>
        <div class="flex justify-center mb-10">
          <div class="h-8 flex-end bg-gray-300 opacity-50 rounded w-1/3"></div>
        </div>
        <!-- Paragraph Skeleton with varying line lengths -->
        <div class="space-y-4 flex flex-col items-end">
          <div class="h-4 bg-gray-300 opacity-50 rounded w-1/2"></div>
          <div class="h-4 bg-gray-300 opacity-50 rounded w-full"></div>
          <div class="h-4 bg-gray-300 opacity-50 rounded w-full"></div>
  
          <div class="h-4 bg-gray-300 opacity-50 rounded w-full"></div>
  
          <div class="h-4 bg-gray-300 opacity-50 rounded w-full"></div>
          <div class="h-4 bg-gray-300 opacity-50 rounded w-full"></div>
          <div class="h-4 bg-gray-300 opacity-50 rounded mt-6 w-1/2"></div>
          <div class="h-4 bg-gray-300 opacity-50 rounded w-full"></div>
          <div class="h-4 bg-gray-300 opacity-50 rounded w-full"></div>
          <div class="h-4 bg-gray-300 opacity-50 rounded w-full"></div>
          <div class="h-4 bg-gray-300 opacity-50 rounded w-full"></div>
          <div class="h-4 bg-gray-300 opacity-50 rounded w-full"></div>
          <div class="h-4 bg-gray-300 opacity-50 rounded w-full"></div>
          <div class="h-4 bg-gray-300 opacity-50 rounded w-full"></div>
          <div class="h-4 bg-gray-300 opacity-50 rounded w-full"></div>
          <div class="h-4 bg-gray-300 opacity-50 rounded w-full"></div>
          <div class="h-4 bg-gray-300 opacity-50 rounded w-full"></div>
          <div class="h-4 bg-gray-300 opacity-50 rounded w-full"></div>
          <div class="h-4 bg-gray-300 opacity-50 rounded w-full"></div>
          <div class="h-4 bg-gray-300 opacity-50 rounded mt-10 w-1/2"></div>
          <div class="h-4 bg-gray-300 opacity-50 rounded w-full"></div>
          <div class="h-4 bg-gray-300 opacity-50 rounded w-full"></div>
        </div>
      </div>
      <h1
        v-show="chapter"
        class="text-sm font-bold"
        :style="{ color: readerStore[$colorMode.value].fontColor }"
      >
        Chapter {{ chapter.chapterNumber }}: {{ chapter.title }}
      </h1>
      <div
        :style="{
          color: readerStore[$colorMode.value].fontColor,
          fontSize: `${readerStore.fontSize}px`,
          whiteSpace: 'pre-wrap',       /* Wrap lines at spaces, preserve existing breaks */
          wordBreak: 'normal',        /* Keep words intact */
          overflowWrap: 'break-word' // Handle extremely long words
        }"
        v-show="chapter"
        v-dompurify-html="processedContent"
        ref="contentDiv"
      ></div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, computed, onMounted, PropType } from "vue";

  const {$colorMode} = useNuxtApp()
  const readerStore = useReaderStore()

  
  const props = defineProps({
    chapter: {
      type: Object as PropType<{
        chapterNumber: number;
        title: string;
        content: string;
        comments: any[]; // Define the type for comments appropriately
      }>,
      required: true,
    },
    loading: {
      type: Boolean,
      default: false,
    },
  });
  
  const contentDiv = ref<HTMLElement | null>(null);
  
  const processedContent = computed(() => {
    if (!props.chapter?.content) return "";
    return props.chapter.content;
  });
  
  onMounted(() => {
   //Any logic that must be executed when the component is mounted
  })
  
  </script>
  
  <style scoped>
  /* Add any component-specific styles here */
  .content {
    transition: filter 0.3s ease;
  }

 
  </style>