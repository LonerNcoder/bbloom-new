<template>
  <div class="absolute z-50 inset-0 flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-blue-50 to-white">
    <!-- Book Icon Container -->
    <div class="relative w-32 h-32 animate-bounce">
      <div class="absolute inset-0 flex items-center justify-center">
        <!-- Simple Book SVG -->
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="96"
          height="96"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          stroke-width="1.5"
          stroke-linecap="round"
          stroke-linejoin="round"
          class="text-blue-700 animate-pulse"
        >
          <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
          <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
        </svg>
      </div>
      <!-- Shadow -->
      <div class="absolute -bottom-2 left-1/2 -translate-x-1/2 w-24 h-1 bg-black/10 rounded-full animate-pulse"></div>
    </div>

    <!-- Loading Text and Facts -->
    <div class="mt-8 text-center">
      <h2 class="text-2xl font-bold text-blue-700 mb-2 animate-pulse">Opening Pages...</h2>
      <div
        class="max-w-md px-6 py-3 text-sm text-gray-600 transition-opacity duration-1000"
        :class="{ 'opacity-100': showFact, 'opacity-0': !showFact }"
      >
        <p class="italic">Did you know?</p>
        <p class="mt-1">{{ currentFact }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount } from 'vue';

const writerFacts = [
  "Shakespeare used 28,829 unique words in his works",
  "Agatha Christie wrote 66 detective novels",
  "J.K. Rowling was rejected by 12 publishers",
  "Ernest Hemingway wrote standing up",
  "Maya Angelou worked as a cable car conductor"
];

const currentFact = ref('');
const showFact = ref(false);

let factTimer;

onMounted(() => {
  factTimer = setTimeout(() => {
    currentFact.value = writerFacts[Math.floor(Math.random() * writerFacts.length)];
    showFact.value = true;
  }, 800);
});

onBeforeUnmount(() => {
  if (factTimer) clearTimeout(factTimer);
});
</script>

<style scoped>
.animate-bounce {
  animation: bounce 1s infinite;
}

.animate-pulse {
  animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
}

@keyframes bounce {
  0%, 100% {
    transform: translateY(-5%);
    animation-timing-function: cubic-bezier(0.8, 0, 1, 1);
  }
  50% {
    transform: translateY(0);
    animation-timing-function: cubic-bezier(0, 0, 0.2, 1);
  }
}

@keyframes pulse {
  0%, 100% {
    opacity: 1;
  }
  50% {
    opacity: .7;
  }
}
</style>