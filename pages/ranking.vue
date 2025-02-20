<template>
  <div class="rankings-container w-full h-full">
    <button class="sidebar-toggle" @click="toggleSidebar">
      <span v-if="isSidebarOpen">Hide</span>
      <span v-else>Show</span> Genres & Filters
    </button>
    <aside class="sidebar flex flex-col gap-5 bg-[--section-bg-color] rounded-md" :class="{ 'sidebar-hidden': !isSidebarOpen }">
      <div>
      <h3>Genres</h3>
      <div class="genre-list-container">
        <ul>
          <li
            v-for="genre in genres"
            :key="genre"
            :class="{ active: selectedGenre === genre }"
            @click="selectGenre(genre)"
          >
            {{ genre }}
          </li>
        </ul>
      </div> 
      </div>
      <div>
      <h3>Ranking Types</h3>
       <ul>
        <li
          v-for="category in rankingCategories"
          :key="category.id"
          :class="{ active: selectedCategory.id === category.id }"
          @click="selectCategory(category)"
        >
          {{ category.name }}
        </li>
      </ul>        
      </div>

    </aside>
    <main class="main-content">
      <section class="rankings">
        <h1>{{ selectedGenre ? `${selectedGenre} Rankings` : 'Rankings' }}</h1>

        <div class="ranking-category bg-[--section-bg-color] rounded-md">
          <div class="card">
            <div class="card-header">
              <h2>{{ selectedCategory.name }}</h2>
            </div>

            <NovelsGrid class="novel-list">
              <NovelCard
                v-for="novel in novels"
                :key="novel.id"
                :novel="novel"
                :to="`/novel/${novel.id}`"
              />
            </NovelsGrid>
          </div>
        </div>
        <!--Removed for view more-->
         <div class="pagination">
          <button @click="previousPage" :disabled="currentPage === 1">Previous</button>
          <span>Page {{ currentPage }} of {{ totalPages || 1 }}</span>
          <button @click="nextPage" :disabled="currentPage === totalPages">Next</button>
        </div>
      </section>
    </main>
  </div>
</template>

<script setup>
import NovelCard from '~/components/NovelCard.vue';
import NovelsGrid from '../components/NovelsGrid.vue';
import { ref, computed, onMounted, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router'; // Import useRoute and useRouter
import { useSmartFetch } from '~/composables/useSmartFetch'


    const novels = ref([]);
    const error = ref(null);
    const loading = ref(true);
    const selectedGenre = ref("Adventure"); // Initially, no genre is selected
    const selectedCategory = ref({ id: 'likes', name: 'Most Popular' }); //default
    const isSidebarOpen = ref(true);  // Track sidebar visibility
    const route = useRoute();       // Access the current route
    const router = useRouter();      // Access the router for navigation
    const currentPage = ref(parseInt(route.query.page) || 1); // Get page from URL, default to 1
    const itemsPerPage = ref(10);  // Number of items per page
    const totalItems = ref(0);      // Total number of novels (from API)
    const {$store} = useNuxtApp()
    const webMode = ref(await $store.getWebMode());
    const totalPages = ref(1);
    var API;
    const config = useRuntimeConfig().public
    if(webMode.value === "safe"){
      API = `${config.baseSafeAPI}search?mode=safe&`
    }else if(webMode.value === "pirate"){
      const basePriateUrl = config.basePriateAPI
      API = basePriateUrl + "?"
    }else{
      API = `${config.baseSafeAPI}search?mode=nsfw&`

    }

    const rankingCategories = ref([
      { id: 'likes', name: 'Most Popular' },
      { id: 'rating', name: 'Highest Rated' },
      { id: 'date', name: 'Most Recent' },
       { id: 'readers', name: 'Readers Picks' }, //added random
    ]);

    // Example list of genres (fetch from API or define statically)
    const genres = ref([
      'Action',
      'Adventure',
      'Fantasy',
      'Sci-Fi',
      'Romance',
      'Mystery',
      'Thriller',
      'Historical',
      'Comedy',
      'Drama',
       // Add more genres as needed
    ]);

    const selectGenre = (genre) => {
      selectedGenre.value = genre;
      currentPage.value = 1; // Reset to page 1 when genre changes
      fetchNovels(); // Fetch novels whenever the genre changes.  Important!

    };
     const selectCategory = (category) => {
      selectedCategory.value = category;
        currentPage.value = 1; // Reset to page 1
      fetchNovels(); // Fetch novels whenever the genre changes.  Important!

    };

    // const filteredNovels = computed(() => {
    //     if (loading.value) {
    //       return []; // Return empty array while loading
    //     }
    //   if (!selectedGenre.value) {
    //       return novels.value;//show all
    //   }

    //   return novels.value.filter((novel) => novel.genres.includes(selectedGenre.value));
    // });

    const toggleSidebar = () => {
      isSidebarOpen.value = !isSidebarOpen.value;
    };
    const previousPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
        updateRoute();
      }
    };

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
         updateRoute();
      }
    };
     const updateRoute = () => {
        router.push({
          query: { ...route.query, page: currentPage.value }, // Keep existing query params
        });
      };

    const fetchNovels = async () => {
      loading.value = true;
      error.value = null;
      try {
        // Construct the API endpoint URL based on selected genre and category
        let url = `${API}genres=${selectedGenre.value}&sort=${selectedCategory.value.id}&limit=${itemsPerPage.value}&page=${currentPage.value}`;  // Base URL with sorting

        //Append multiple genres later

        const data = await $fetch(url);
        novels.value = data.novels; // Update the novels list
        totalPages.value = data.totalPages;   // Get the total count from the API response
        currentPage.value = data.currentPage;
        //filter by genres if selected


      } catch (err) {
        error.value = err.message || 'Failed to fetch novels';
        console.error(err);
      } finally {
        loading.value = false;
      }
    };


    // Watch for changes in the route (e.g., user manually edits the URL)
    watch(
      () => route.query.page,
      (newPage) => {
          currentPage.value = parseInt(newPage) || 1;
          fetchNovels(); // Re-fetch when page changes via URL
        }

    );

    onMounted(fetchNovels); // Initial fetch
</script>

<style scoped>
.rankings-container {
  display: flex;
  gap: 20px;
}

.sidebar {
  width: 200px;
  padding: 20px;
  border-right: 1px solid #ddd;
  transition: transform 0.3s ease; /* Smooth transition */
}

.sidebar-hidden {
  transform: translateX(-100%); /* Hide sidebar off-screen */
}
.sidebar-toggle {
   display: none; /* Hide by default on larger screens */
    background-color: #007bff;
    color: white;
    border: none;
    padding: 10px 15px;
    cursor: pointer;
    margin-bottom: 10px; /* Add some spacing */
    border-radius: 4px;
}

.sidebar h3 {
  margin-top: 0;
  margin-bottom: 10px;
}

.sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

/* Genre List Container for Scroll */
.genre-list-container {
  max-height: 500px; /* Adjust as needed */
  overflow-y: auto;
}


.sidebar li {
  padding: 8px 12px;
  cursor: pointer;
  border-bottom: 1px solid #eee;
}

.sidebar li:hover {
  background-color: #f8f9fa;
}

.sidebar li.active {
  background-color: #e9ecef;
  font-weight: bold;
}

.main-content {
  flex: 1; /* Take up remaining space */
  padding: 20px;
}

.rankings {
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100vh;
  justify-content: space-between;
}

.card {
  border: none;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.card-header {
  display: flex;
  align-items: center;
  padding: 10px;
}

.card-header h2 {
  margin: 0;
  font-size: 1.5rem;
  padding: 10px 20px;
}

.novel-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 10px;
}

/* Mobile Styles */
@media (max-width: 768px) {
  .rankings-container {
    flex-direction: column; /* Stack sidebar and content */
  }

  .main-content{
    padding:0;
  }
  .main-content section h1{
    padding-left: 10px;
  }

  .sidebar {
    width: 100%; /* Full width on mobile */
    border-right: none;
    border-bottom: 1px solid #ddd; /* Add a bottom border */
    padding-bottom: 10px; /* Add padding at the bottom */
    /* Initially hidden on mobile */
     position: relative;
  }

   .sidebar-toggle {
        display: block; /* Show the toggle button on mobile */
    }

  .genre-list-container{
     max-height: 150px;
  }
    .novel-list {
      grid-template-columns: repeat(auto-fill, minmax(150px, 1fr)); /* Smaller cards on mobile*/
    }
}

.pagination {
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 10px;
  margin-top: 20px;
}

.pagination button {
  background-color: #007bff;
  color: white;
  border: none;
  padding: 8px 12px;
  cursor: pointer;
  border-radius: 4px;
}

.pagination button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}
</style>