<template>
<div class="flex flex-col min-h-screen pt-8">
    <!-- Floating Search Bar -->
    <div
      class="sticky top-4 w-full flex justify-center z-50 transition-all duration-300"
      :class="{ 'w-16': isSearchBarCollapsed, 'w-[90%]': !isSearchBarCollapsed }"
    >
      <div
        class="flex items-center bg-white shadow-md rounded-full p-2 border border-gray-200 transition-all duration-300"
        :class="{ 'max-w-xs': isSearchBarCollapsed, 'w-[50%]': !isSearchBarCollapsed }"
      >
        <!-- Search Icon -->
        <button
          @click="toggleSearchBar"
          class="px-3 text-gray-500 flex items-center justify-center transition-all duration-300"
        >
          <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </button>

        <!-- Search Input -->
        <input
          v-if="!isSearchBarCollapsed"
          type="text"
          placeholder="Search novels..."
          class="flex-grow outline-none bg-transparent text-gray-700 transition-opacity duration-300"
          v-model="filters.search"
          @keyup.enter="handleSearch"

        />

        <!-- Filter Button -->
  <!-- Filter Button with Badge -->
        <div class="relative">
          <button
            @click="toggleFilterModal"
            class="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600 hover:bg-blue-700 text-white transition-all duration-300"
          >
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 14.414V19a1 1 0 01-.447.894l-4 2A1 1 0 017 21v-6.586L3.293 7.707A1 1 0 013 7V4z"
              />
            </svg>
          </button>
          <!-- Active Filter Badge -->
          <span 
            v-if="activeFilterCount > 0"
            class="absolute -top-1 -right-1 bg-red-500 text-white rounded-full text-xs w-5 h-5 flex items-center justify-center"
          >
            {{ activeFilterCount }}
          </span>
        </div>
      </div>
    </div>
    <!-- Filter Modal -->
    <div
      v-if="isFilterModalOpen"
      class="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50"
    >
      <div
        class="bg-slate-800 rounded-lg shadow-lg w-[90%] max-w-xl p-6 text-white flex flex-col overflow-hidden"
        style="max-height: 90vh;"
      >
        <!-- Header -->
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium">Filters</h2>
          <button @click="toggleFilterModal" class="text-gray-300 hover:text-white">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <!-- Filter Form -->
        <form @submit.prevent="handleSearch" class="flex flex-col overflow-auto space-y-4" style="max-height: 80vh;">
          <!-- Filter Sections -->
          <div class="bg-slate-700 rounded-lg p-4">
            <h3 class="font-medium mb-2">Status</h3>
            <select
              class="w-full p-2 border rounded-lg bg-slate-600 text-white border-slate-500 focus:ring-2 focus:ring-blue-500"
              v-model="filters.status"
            >
              <option value="all">All</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
              <option value="hiatus">Hiatus</option>
            </select>
          </div>

          <div class="bg-slate-700 rounded-lg p-4">
            <h3 class="font-medium mb-2">Sort By</h3>
            <select
              class="w-full p-2 border rounded-lg bg-slate-600 text-white border-slate-500 focus:ring-2 focus:ring-blue-500"
              v-model="filters.sort"
            >
              <option value="date">Date</option>
              <option value="views">View</option>
              <option value="readers">Reader</option>
              <option value="chapters">Chapter</option>
              <option value="likes">Like</option>
            </select>
          </div>

          <div class="bg-slate-700 rounded-lg p-4">
            <h3 class="font-medium mb-2">Order</h3>
            <select
              class="w-full p-2 border rounded-lg bg-slate-600 text-white border-slate-500 focus:ring-2 focus:ring-blue-500"
              v-model="filters.order"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>

          <div class="bg-slate-700 rounded-lg p-4">
            <div class="flex justify-between items-center mb-2">
              <h3 class="font-medium">Genres</h3>
              <div class="flex items-center space-x-2">
                <span class="text-sm text-gray-300">Match:</span>
                <div class="flex bg-slate-600 rounded-lg p-1">
                  <button
                    type="button"
                    @click.stop="filters.type = 'or'"
                    :class="{
                      'bg-blue-600 text-white': filters.type === 'or',
                      'text-gray-300': filters.type !== 'or'
                    }"
                    class="px-3 py-1 rounded-md text-sm transition-colors duration-200"
                  >
                    Any
                  </button>
                  <button
                    type="button"
                    @click.stop="filters.type = 'and'"
                    :class="{
                      'bg-blue-600 text-white': filters.type === 'and',
                      'text-gray-300': filters.type !== 'and'
                    }"
                    class="px-3 py-1 rounded-md text-sm transition-colors duration-200"
                  >
                    All
                  </button>
                </div>
              </div>
            </div>
            <div
              class="space-y-2 max-h-48 overflow-y-auto custom-scrollbar"
              style="max-height: 10rem;"
            >
              <label
                v-for="genre in genresList.flat()"
                :key="genre"
                class="flex items-center space-x-2 p-1 hover:bg-slate-600 cursor-pointer rounded transition-colors duration-200"
              >
                <input
                  type="checkbox"
                  :value="genre"
                  v-model="filters.genres"
                  class="rounded text-blue-500 focus:ring-blue-500 bg-slate-600 border-slate-500"
                />
                <span class="text-sm">{{ genre }}</span>
              </label>
            </div>
          </div>

          <!-- Apply Filters Button -->
          <button
            type="submit"
            class="w-full mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors duration-200"
          >
            Apply Filters
          </button>
        </form>
      </div>
    </div>
  
      <!-- Right Content Area -->
      <div class="flex-1 p-6">
        <!-- Results Count -->
        <div class="mb-6">
          <h2 class="text-xl font-semibold">
            {{ initialNovels.length }} Results Found
          </h2>
        </div>
  
        <!-- Novel List -->
        <div class="space-y-6">
          <div 
            v-for="novel in initialNovels" 
            :key="novel.id"
            :class="[
              'bg-white rounded-lg shadow p-4 flex flex-col sm:flex-row gap-4 hover:shadow-lg transition-all duration-300',
              expandedNovelId === novel.id ? 'h-auto' : 'sm:h-[16rem]'
            ]"
            @click="router.push(`/novel/${novel.id}`)"
          >
            <!-- Rest of the novel card content remains the same -->
            <!-- Novel Cover -->
            <div class="w-full sm:w-36 h-48 sm:h-56 bg-gray-200 rounded-lg overflow-hidden flex-shrink-0">
              <img 
                :src="novel.coverImage || '${API}placeholder/144/224'" 
                :alt="novel.title"
                class="w-full h-full object-cover"
              />
            </div>
  
            <!-- Novel Info -->
            <div class="flex-1 overflow-hidden">
              <div class="flex justify-between items-start">
                <div>
                  <h3 class="text-lg font-semibold">{{ novel.title }}</h3>
                  <p class="text-sm text-gray-500">{{ novel.author }}</p>
                </div>
                <div class="text-sm text-gray-500">
                  Rating: {{ novel.rating || 'N/A' }}
                </div>
              </div>
  
              <!-- Stats -->
              <div class="flex flex-wrap gap-4 mt-2 text-sm text-gray-600">
                <span>{{ novel.status }}</span>
                <span>{{ novel.chapters }} Chapters</span>
                <span>{{ novel.views }} Views</span>
                <span>{{ novel.readers }} Readers</span>
              </div>
  
              <!-- Genres -->
              <div class="mt-2 flex flex-wrap gap-2">
                <span
                  v-for="genre in novel.genres"
                  :key="genre.id"
                  class="px-2 py-1 bg-gray-100 rounded-full text-xs text-gray-600"
                >
                  {{ genre.name }}
                </span>
              </div>
  
              <!-- Summary Section -->
              <div class="mt-3">
                <div 
                  :class="[
                    'text-sm text-gray-700 relative',
                    expandedNovelId !== novel.id ? 'line-clamp-2' : ''
                  ]"
                >
                  {{ novel.summary }}
                </div>
                
                <!-- Show More/Less Button -->
                <button 
                  v-if="novel.summary && novel.summary.length > 300"
                  @click="toggleExpand(novel.id)"
                  class="text-blue-600 text-sm mt-1 hover:text-blue-700 focus:outline-none"
                >
                  {{ expandedNovelId === novel.id ? 'Show Less' : 'Show More' }}
                </button>
              </div>
            </div>
          </div>
        </div>

      </div>
    </div>
  </template>
  
<script setup>
import { ref, reactive, computed, watch } from 'vue';
import { useRouter, useRoute } from 'vue-router';

const props = defineProps({
  initialNovels: {
    type: Array,
    default: () => []
  },
  filter: {
    type: Object,
    default: () => ({})
  },
  activeFilterCount: {
    type: Number,
    default: 0
  }
});


const router = useRouter();
const route = useRoute();

const emit = defineEmits(['search']);

const expandedNovelId = ref(null);
const isSidebarOpen = ref(true);
const isFilterModalOpen = ref(false);
const isSearchBarCollapsed = ref(false);

// Initialize filters with props.filter or default values
const filters = reactive({
  search: props.filter.search || route.query.search || '',
  status: props.filter.status || 'all',
  sort: props.filter.sort || 'date',
  order: props.filter.order || 'desc',
  genres: props.filter.genres || [],
  tags: props.filter.tags || [],
  type: props.filter.type || 'or'
});

const genresList = [
'Action', 'Adventure', 'Comedy', 'Drama',
'Ecchi', 'Fantasy', 'Game', 'Gender-Bender',
'Harem', 'Historical', 'Horror', 'Josei',
'Martial-Arts', 'Mature', 'Mecha', 'Military',
'Mystery', 'Psychological', 'Romance', 'School-Life',
'Sci-Fi', 'Seinen', 'Shoujo', 'Shoujo-Ai',
'Shounen', 'Shounen-Ai', 'Slice-Of-Life', 'Smut',
'Sports', 'Supernatural', 'Tragedy', 'Wuxia',
'Xianxia', 'Xuanhuan', 'Yuri'
];

const toggleSidebar = () => {
  isSidebarOpen.value = !isSidebarOpen.value;
};

const toggleExpand = (novelId) => {
  expandedNovelId.value = expandedNovelId.value === novelId ? null : novelId;
};

const handleSearch = () => {
  isFilterModalOpen.value = false;
  console.log(filters.genres.map(encodeURIComponent).join(","));
  emit('search', { ...filters });
  
};

const toggleSearchBar = () => {
  isSearchBarCollapsed.value = !isSearchBarCollapsed.value;
};

const toggleFilterModal = () => {
  isFilterModalOpen.value = !isFilterModalOpen.value;
};

const handleScroll = () => {
  const scrollTop = window.scrollY;
  isSearchBarCollapsed.value = scrollTop > 50; // Collapse after scrolling 50px
};

window.addEventListener('scroll', handleScroll);

// Watch for changes in props.filter and update the local filters
watch(
  () => props.filter,
  (newFilter) => {
    if (newFilter) {
      filters.search = newFilter.search || '';
      filters.status = newFilter.status || 'all';
      filters.sort = newFilter.sort || 'date';
      filters.order = newFilter.order || 'desc';
      filters.genres = newFilter.genres || [];
      filters.tags = newFilter.tags || [];
      filters.type = newFilter.type || 'or';
    }
  },
  { deep: true, immediate: true }
);
  </script>
  
  <style scoped>
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
  }
  
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #475569 #1e293b;
  }
  
  /* Smooth transitions */
  .transition-all {
    transition-property: all;
    transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
    transition-duration: 300ms;
  }
  .sticky {
    transition: all 0.6s ease-in-out;
  }
  .custom-scrollbar::-webkit-scrollbar {
    width: 1px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background-color: #4a5568; /* Slate gray */
    border-radius: 4px;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb:hover {
    background-color: #2d3748; /* Darker slate gray */
  }

  </style>