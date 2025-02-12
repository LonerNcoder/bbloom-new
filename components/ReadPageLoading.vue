<template>
    <div class="max-w-3xl mx-auto p-8 bg-white">
      <!-- Chapter Header -->
      <div class="mb-16">
        <div class="h-6 w-48 bg-gray-200 rounded skeleton-pulse"></div>
      </div>
  
      <!-- Book Number -->
      <div class="mb-16 flex justify-center">
        <div class="h-4 w-24 bg-gray-200 rounded skeleton-pulse"></div>
      </div>
  
      <!-- Chapter Number -->
      <div class="mb-8 flex justify-center">
        <div class="h-4 w-32 bg-gray-200 rounded skeleton-pulse"></div>
      </div>
  
      <!-- Long Chapter Title -->
      <div class="mb-12">
        <div class="h-4 w-full bg-gray-200 rounded skeleton-pulse mb-2"></div>
        <div class="h-4 w-5/6 bg-gray-200 rounded skeleton-pulse mb-2"></div>
        <div class="h-4 w-4/6 bg-gray-200 rounded skeleton-pulse"></div>
      </div>
  
      <!-- Paragraph blocks -->
      <div class="space-y-6">
        <!-- First paragraph -->
        <div class="space-y-2">
          <div 
            v-for="i in 6" 
            :key="`p1-${i}`"
            class="h-4 bg-gray-200 rounded skeleton-pulse"
            :style="{ width: `${Math.random() * 10 + 90}%` }"
          ></div>
        </div>
        
        <!-- Second paragraph -->
        <div class="space-y-2">
          <div 
            v-for="i in 8" 
            :key="`p2-${i}`"
            class="h-4 bg-gray-200 rounded skeleton-pulse"
            :style="{ width: `${Math.random() * 10 + 90}%` }"
          ></div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  // No additional script needed for this component
  </script>
  
  <style scoped>
  .skeleton-pulse {
    animation: skeletonPulse 1.5s ease-in-out infinite;
  }
  
  @keyframes skeletonPulse {
    0% {
      opacity: 1;
    }
    50% {
      opacity: 0.4;
    }
    100% {
      opacity: 1;
    }
  }
  </style>