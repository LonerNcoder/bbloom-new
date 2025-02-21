<template>
  <div class="flex flex-col w-full h-screen bg-[--background-color]">

    <!-- Navigation Bar -->
    <div class="flex justify-between items-center p-4 sticky top-0 z-10">
      <div class="flex gap-1 bg-gray-100 dark:bg-gray-900 p-1 rounded-lg">
        <button
          v-for="tab in tabs"
          :key="tab"
          @click="activeTab = tab"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
            activeTab === tab
              ? 'bg-white dark:bg-gray-800 text-black dark:text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          ]"
        >
          {{ tab }}
        </button>
      </div>
      
      <button class="flex items-center gap-2 bg-[--add-group-btn-bg-color] hover:bg-[--add-group-btn-bg-color] text-[--add-group-btn-text-color]  dark:hover:bg-gray-200 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200">
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
          <path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        Add group
      </button>
    </div>

    <!-- Content Area with custom scrollbar -->
    <div class="px-4 py-6  overflow-y-auto flex-1">
      <!-- Music tab content -->
      <template v-if="activeTab === 'Default'">
        <ContentSection 
          title="Read Now" 
          subtitle="Saved by you."
          :items="library" 
        />
        
        <ContentSection 
          title="Made for You" 
          subtitle="Your personal recommendations. Updated daily."
          :items="madeForYouItems" 
        />
      </template>

      <template v-if="activeTab === 'Music'">
        <ContentSection 
          title="Read Now" 
          subtitle="Saved by you."
          :items="listenNowItems" 
        />
        
        <ContentSection 
          title="Made for You" 
          subtitle="Your personal recommendations. Updated daily."
          :items="madeForYouItems" 
        />
      </template>
      
      <!-- Podcasts tab content -->
      <div v-else-if="activeTab === 'Podcasts'" class="flex items-center justify-center h-64">
        <p class="text-gray-500 dark:text-gray-400">Podcast content would appear here</p>
      </div>
      
      <!-- Live tab content -->
      <div v-else-if="activeTab === 'Live'" class="flex items-center justify-center h-64">
        <p class="text-gray-500 dark:text-gray-400">Live content would appear here</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
const { $store } = useNuxtApp();
const userStore = useUserStore();

const webModeStore = useWebModeStore();
var API;
const config = useRuntimeConfig().public;
if (webModeStore.webMode === "safe") {
  API = config.baseSafeAPI;
} else if (webModeStore.webMode === "pirate") {
  API = config.basePriateAPI;
} else {
  API = config.baseSafeAPI;
}
// Navigation state
const activeTab = ref('Default');
const tabs = ['Default', 'Music', 'Podcasts', 'Live'];

const headers = await $store.getNormalHeaders();
const userId = userStore.id;
const { data, error } = useSmartFetch(`${API}user/${userId}/library`, {
  method: "GET",
  headers: headers
});
const library = computed(() => data.value?.libraries || []);

// Sample album data with size percentage (50-100%)
const listenNowItems = [
  { id: 1, title: 'React Rendezvous', artist: 'Ethan Byte', image: '/api/placeholder/300/300', percentage: 100 },
  { id: 2, title: 'Async Awakenings', artist: 'Nina Netcode', image: '/api/placeholder/300/300', percentage: 85 },
  { id: 3, title: 'The Art of Reusability', artist: 'Lena Logic', image: '/api/placeholder/300/300', percentage: 70 },
  { id: 4, title: 'Stateful Symphony', artist: 'Beth Binary', image: '/api/placeholder/300/300', percentage: 60 },
];

const madeForYouItems = [
  { id: 5, title: 'Functional Fusion', artist: 'Alan Algorithm', image: '/api/placeholder/300/300', percentage: 90 },
  { id: 6, title: 'Loop Legends', artist: 'Catherine Cache', image: '/api/placeholder/300/300', percentage: 75 },
  { id: 7, title: 'Redux Rhythms', artist: 'Thomas Terminal', image: '/api/placeholder/300/300', percentage: 65 },
  { id: 8, title: 'API Anthems', artist: 'Gina Git', image: '/api/placeholder/300/300', percentage: 50 },
];
</script>
<style scoped>
::-webkit-scrollbar {
  width: 6px;
  height: 6px;
}

::-webkit-scrollbar-track {
  background: transparent;
}

::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 3px;
}

.dark ::-webkit-scrollbar-thumb {
  background-color: rgba(255, 255, 255, 0.3);
}

/* Firefox scrollbar styles */
* {
  scrollbar-width: thin;
  scrollbar-color: rgba(0, 0, 0, 0.5) transparent;
}

.dark * {
  scrollbar-color: rgba(255, 255, 255, 0.3) transparent;
}
</style>
