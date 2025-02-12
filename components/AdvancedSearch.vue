<template>
    <div class="w-full max-w-4xl mx-auto bg-white rounded-lg shadow-md p-6 mb-8">
      <form @submit.prevent="handleSearch">
        <div class="flex gap-4 mb-4">
          <div class="flex-1 relative">
            <input
              type="text"
              placeholder="Search novels..."
              class="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              v-model="filters.query"
            />
            <!-- You'll need to add an icon here -->
            <span class="absolute left-3 top-2.5 text-gray-400">
              🔍
            </span>
          </div>
          <button
            type="button"
            @click="isAdvancedOpen = !isAdvancedOpen"
            class="px-4 py-2 text-blue-600 border border-blue-600 rounded-lg hover:bg-blue-50"
          >
            Advanced Search
          </button>
          <button
            type="submit"
            class="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Search
          </button>
        </div>
  
        <div v-if="isAdvancedOpen" class="space-y-6 p-4 border rounded-lg">
          <div class="flex gap-8">
            <div class="flex-1">
              <h3 class="font-medium mb-2">Status</h3>
              <select
                class="w-full p-2 border rounded-lg"
                v-model="filters.status"
              >
                <option value="all">All</option>
                <option value="hiatus">Hiatus</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            
            <div class="flex-1">
              <h3 class="font-medium mb-2">Sort By</h3>
              <select
                class="w-full p-2 border rounded-lg"
                v-model="filters.sortBy"
              >
                <option value="date">Addition Date</option>
                <option value="views">View</option>
                <option value="reader">Reader</option>
                <option value="chapters">Chapter</option>
              </select>
            </div>
  
            <div class="flex-1">
              <h3 class="font-medium mb-2">Order</h3>
              <select
                class="w-full p-2 border rounded-lg"
                v-model="filters.sortOrder"
              >
                <option value="asc">Ascending</option>
                <option value="desc">Descending</option>
              </select>
            </div>
          </div>
  
          <div>
            <h3 class="font-medium mb-2">Genres</h3>
            <div class="grid grid-cols-4 gap-2">
              <label 
                v-for="genre in genresList.flat()" 
                :key="genre" 
                class="flex items-center space-x-2"
              >
                <input
                  type="checkbox"
                  :value="genre"
                  v-model="filters.genres"
                  class="rounded text-blue-600 focus:ring-blue-500"
                />
                <span class="text-sm">{{ genre }}</span>
              </label>
            </div>
          </div>
        </div>
      </form>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue';
  
  const props = defineProps({
    initialFilters: {
      type: Object,
      default: () => ({})
    }
  });
  
  const emit = defineEmits(['search']);
  
  const isAdvancedOpen = ref(false);
  
  const filters = reactive({
    query: '',
    status: 'all',
    sortBy: 'addition_date',
    sortOrder: 'descending',
    genres: [],
    ...props.initialFilters
  });
  
  const genresList = [
    ['Action', 'Adventure', 'Comedy', 'Drama'],
    ['Ecchi', 'Fantasy', 'Game', 'Gender-Bender'],
    ['Harem', 'Historical', 'Horror', 'Josei'],
    ['Martial-Arts', 'Mature', 'Mecha', 'Military'],
    ['Mystery', 'Psychological', 'Romance', 'School-Life'],
    ['Sci-Fi', 'Seinen', 'Shoujo', 'Shoujo-Ai'],
    ['Shounen', 'Shounen-Ai', 'Slice-Of-Life', 'Smut'],
    ['Sports', 'Supernatural', 'Tragedy', 'Wuxia'],
    ['Xianxia', 'Xuanhuan', 'Yuri']
  ];
  
  const handleSearch = () => {
    emit('search', { ...filters });
  };
  </script>
  
  <style scoped>
  /* Add any additional styling here if needed */
  </style>