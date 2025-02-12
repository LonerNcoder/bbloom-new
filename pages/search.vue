<template>
  <div>
    <SearchLayout 
      :initial-novels="filteredNovels" 
      @search="handleSearch" 
      :pending="pending"
      :error="error"
      :web-mode="webMode"
      :filters="filters"
      :activeFilterCount="activeFilterCount"
    />
    
    <!-- Pagination Controls -->
    <div class="p-4 flex justify-center items-center gap-2">
            <button
                :disabled="pagination.currentPage === 1"
                @click="goToPage(pagination.currentPage - 1)"
                class="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Prev
              </button>
              <button
                v-for="page in pagination.totalPages"
                :key="page"
                @click="goToPage(page)"
                :class="[
                  'px-4 py-2 text-sm border rounded-md hover:bg-gray-50',
                  pagination.currentPage === page ? 'bg-blue-100 font-bold' : ''
                ]"
              >
                {{ page }}
              </button>
              <button
                :disabled="pagination.currentPage === pagination.totalPages"
                @click="goToPage(pagination.currentPage + 1)"
                class="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
              <button
                @click="showAllChapters"
                class="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
              >
                View All
              </button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useNuxtApp } from '#app';
import SearchLayout from '~/components/SearchLayout.vue';
import { useSmartFetch } from '~/composables/useSmartFetch';
const route = useRoute();
const { $store } = useNuxtApp();
const webMode = ref(await $store.getWebMode())
const config = useRuntimeConfig().public
var API = webMode.value === "Safe"? config.baseSafeAPI : config.basePriateAPI

// Extract query parameters from the route
const search = ref(route.query.search || "");
const page = ref(route.query.page || 1);
const limit = ref(route.query.limit || 20);
const sort = ref(route.query.sort || "views");
const order = ref(route.query.order || "desc");
const status = ref(route.query.status || "all");
const genres = ref(route.query.genres?.split(',') || []); // Handle array conversion
const tags = ref(route.query.tags?.split(',') || []);
const type = ref(route.query.type || "");

console.log(route)
const defaultFilters = {
  status: 'all',
  genres: [],
  tags: [],
  type: 'or',
  sort: 'views',
  order: 'desc'
};
const activeFilterCount = computed(() => {
  let count = 0;
  if (status.value !== defaultFilters.status) count++;
  if (genres.value.length > defaultFilters.genres.length) count++;
  if (tags.value.length > defaultFilters.tags.length) count++;
  if (type.value !== defaultFilters.type) count++;
  if (sort.value !== defaultFilters.sort) count++;
  if (order.value !== defaultFilters.order) count++;
  return count;
});
// Reactive pagination
const pagination = ref({
  currentPage: page.value,
  totalItems: 0,
  totalPages: 0,
  pageSize: 20,
});

// Reactive search query
const searchQuery = ref(search);
const filters = ref({})

// Reactive fetch parameters
const fetchParams = computed(() => ({
  mode: webMode.value,
  search: searchQuery.value,
  genres: genres.value.map(encodeURIComponent).join(","),
  page: page.value,
  limit: limit.value,
  status: status.value,
  sort: sort.value,
  order: order.value,
  tags: tags.value.map(encodeURIComponent).join(","),
  type: type.value,
}));

// Use the smart fetch composable
const { data, pending, error, refresh } = useSmartFetch(`${API}search/`, {
  method: 'GET',
  params: fetchParams, // Pass computed params
  enableCache: true,
  cacheTime: 60000,
  dependencies: [fetchParams], // Watch computed params for changes
});


// Reactive novels list
const novels = computed(() => data.value?.novels || []);

// Update pagination based on fetched data
pagination.value.totalItems = data.value?.totalCount || 0;
pagination.value.totalPages = data.value?.totalPages || 0;

// Filtered novels based on search
const filteredNovels = computed(() => {
  if (!searchQuery.value) return novels.value;
  const query = searchQuery.value.toLowerCase();
  return novels.value.filter(
    (novel) =>
      novel.title.toLowerCase().includes(query) ||
      novel.author?.toLowerCase().includes(query)
  );
});

// Handle search with new filters
const handleSearch = async (filters) => {
  searchQuery.value = filters.search || searchQuery.value;
  page.value = filters.page || page.value;
  limit.value = filters.limit || limit.value;
  sort.value = filters.sort || sort.value;
  order.value = filters.order || order.value;
  genres.value = filters.genres || genres.value;
  tags.value = filters.tags || tags.value;
  type.value = filters.type || type.value;
  status.value = filters.status || status.value;
};

// Load web mode
const loadWebMode = async () => {
  try {
    const mode = await $store.getWebMode();
    webMode.value = mode;

    if (mode !== "Safe") {
      console.log("Pirate mode activated");
      // Add pirate mode specific logic here
    }
  } catch (err) {
    console.error('Failed to load web mode:', err);
  }
};

const goToPage = (p) => {
  page.value = parseInt(p);
}
// watch(data, (newData) => {
//   pagination.value = {
//     currentPage: newData?.currentPage || 1,

//     totalItems: newData?.totalCount || 0,
//     totalPages: newData?.totalPages || 0,
//     pageSize: limit.value
//   };
// });

watch(
  () => route.query,
  (newQuery) => {
    // Update all reactive values from URL query params
    page.value = newQuery.page ? parseInt(newQuery.page) : 1;
    limit.value = newQuery.limit ? parseInt(newQuery.limit) : 20;
    sort.value = newQuery.sort || 'views';
    order.value = newQuery.order || 'desc';
    genres.value = newQuery.genres ? newQuery.genres.split(',') : [];
    tags.value = newQuery.tags ? newQuery.tags.split(',') : [];
    type.value = newQuery.type || 'or';
    searchQuery.value = newQuery.search || '';
    status.value = newQuery.status || 'all';

    // If you want to maintain pagination sync with URL
    pagination.value.currentPage = page.value;
    pagination.value.pageSize = limit.value;
    
    // Optional: Trigger a refresh if needed
    // refresh();
  },
  { immediate: true, deep: true }
);
// Initial load
onMounted(() => {
  loadWebMode();
});
</script>