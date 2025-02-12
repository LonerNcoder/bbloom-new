<template>
  <LoadingAnimation v-if="pending || pending2 || pending3 || pending4"/>
  <div v-if="error || error2 || error3 || error4">
      {{ error || error2 || error3 || error4 }}
  </div>
  <div v-else>
<div>
  <div class="home-container">
    <!-- Search bar stays the same -->
    <div class="search-container">
      <div class="search-bar">
        <input type="text" class="search-input" v-model="searchQuery" @keyup.enter="goToSearch" placeholder="Search novels...">
        <button class="search-button" @click="goToSearch" ><Search/></button>
      </div>
    </div>
    
    <main class="main-content">
      <div class="row">
        <!-- Left content -->
        <div class="left-content">
          <!-- Classic Series section -->
          <div class="card">
            <section class="classic-series card-body">
              <div class="card-header">
                <h2>Classic Series</h2>
                <a class="viewmore-btn">
                  <button @click="viewMore('classic')">All <SquareChevronRight/></button>
                </a>
              </div>
              <NovelsGrid class="novel-list">
                <NovelCard 
                  v-for="novel in filteredClassics" 
                  :key="novel.id" 
                  :novel="novel" 
                  :bgcolor="novel.bgcolor"
                  :to="`/novel/${novel.id}`"
                  :webMode="webMode"
                />
              </NovelsGrid>
            </section>
          </div>

          <!-- Originals section -->
          <div class="card">
            <section class="originals card-body">
              <div class="card-header">
                <h2>Originals</h2>
                <a class="viewmore-btn">
                  <button @click="viewMore('original')">All <SquareChevronRight/></button>
                </a>
              </div>
              <NovelsGrid class="novel-list">
                <NovelCard 
                  v-for="novel in filteredOriginals" 
                  :key="novel.id" 
                  :novel="novel" 
                  :bgcolor="novel.bgcolor"
                  :to="`/novel/${novel.id}`" 
                  :webMode="webMode"
                />
              </NovelsGrid>
            </section>
          </div>
        </div>

        <!-- Right content -->
        <div class="right-content">
          <section>
            <div class="card-header">
                <h2>Latest Trending</h2>
                <a class="viewmore-btn">
                  <button @click="viewTrending('rating')">All <SquareChevronRight/></button>
                </a>
              </div>
            <div class="novel-list-vertical">
              <!-- <div v-for="novel in novels" :key="novel.id" class="novel-card-vertical"> -->
  <!-- Card Container -->
    <div v-for="novel in filteredRankings" :key="novel.id" class="novel-card-vertical">
        <div class="novel-card-container">
          <!-- Background Layer (Blurred & Zoomed) -->
          <div
            class="novel-background"
            :style="{ backgroundImage: `url(${novel.coverImage})` }"
          ></div>

          <!-- Content Layer -->
          <div class="novel-content">
            <!-- Contained Cover Image -->
            <img :src="novel.coverImage" :alt="novel.title" class="novel-cover-vertical" />

            <!-- Novel Details -->
            <div class="novel-info">
              <h3 class="novel-title">{{ novel.title }}</h3>
              <p class="novel-secondary-text">{{ novel.author || 'Author Name' }}</p>
              <p class="novel-description">{{ novel.summary }}</p>
              <button @click="navigateTo(`/novel/${novel.id}`)" class="novel-action">Read</button>
            </div>
          </div>
      </div>
    </div>
            
            </div>
          </section>
        </div>
      </div>

      <!-- Random novels section -->
      <section class="random-novels">
        <div class="card-header">
        <h2>Random Novels</h2>
        <a class="viewmore-btn">
                  <button @click="viewMore('random')">Shuffle</button>
                </a>
        </div>
        <div class="novel-list vertical-list">
          <NovelCard 
            v-for="novel in filteredRandoms" 
            :key="novel.id" 
            :novel="novel" 
            :bgcolor="novel.bgcolor"

            :to="`/novel/${novel.id}`" 
            :webMode="webMode"
          />
        </div>
      </section>
    </main>
  </div>
</div>
</div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useSmartFetch } from '~/composables/useSmartFetch'
import NovelCard from '~/components/NovelCard.vue'
import NovelsGrid from '~/components/NovelsGrid.vue'

import {SquareChevronRight, Search} from 'lucide-vue-next'

const {$store} = useNuxtApp()
const router = useRouter();
const url = ref("${API}search")
const webMode = ref(await $store.getWebMode())
var API;
const config = useRuntimeConfig().public
if(webMode.value === "Safe"){
  API = `${config.baseSafeAPI}search?mode=Safe&`
}else if(webMode.value === "Pirate"){
  const basePriateUrl = config.basePriateAPI
  API = basePriateUrl + "?"
}else{
  API = `${config.baseSafeAPI}search?mode=Nsfw&`
}

// Reactive state
const searchQuery = ref('')
const headers = await $store.getNormalHeaders()
const { data: data1, pending, error } = useSmartFetch(`${API}genres=classic`, { //renamed data to data1
  enableCache: true,
  cacheTime: 60000,
  headers: headers
})

// Computed properties with defensive checks
const filteredClassics = computed(() =>
  (data1.value?.novels ?? []).map(novel => ({
    ...novel,
    bgcolor: getRandomIntInclusive(1, 5)
  }))
);

const { data: data2, pending: pending2, error: error2 } = useSmartFetch(`${API}genres=original`, { //renamed data to data2
  enableCache: true,
  cacheTime: 60000,
  headers: headers
})

const filteredOriginals = computed(() =>
  (data2.value?.novels ?? []).map(novel => ({
    ...novel,
    bgcolor: getRandomIntInclusive(1, 5)
  }))
);

const { data: data3, pending: pending3, error: error3 } = useSmartFetch(`${API}genres=random`, { //renamed data to data3
  enableCache: true,
  cacheTime: 60000,
  headers: headers
})

const filteredRandoms = computed(() =>
  (data3.value?.novels ?? []).map(novel => ({
    ...novel,
    bgcolor: getRandomIntInclusive(1, 5)
  }))
);

const { data: data4, pending: pending4, error: error4 } = useSmartFetch(`${API}sort=rating`, { //renamed data to data4
  enableCache: true,
  cacheTime: 60000,
  headers: headers
})

const filteredRankings = computed(() =>
  (data4.value?.novels ?? []).map(novel => ({
    ...novel,
    bgcolor: getRandomIntInclusive(1, 5)
  }))
);


// Methods
const viewMore = (category) => {
  router.push({
    path: '/search',
    query: {
      genres: category,
      limit: 30
    }
  })
}
const viewTrending = (sort) =>{
  router.push(
    {
      path: '/search',
      query: {
        sort: sort,
        limit:30
      }
    }
  )
}

const goToSearch = () =>{
  router.push({
    path: '/search',
    query: {
      search: searchQuery.value,
      limit: 30
    }
  })
}

function getRandomIntInclusive(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

const bgcolor = getRandomIntInclusive()
</script>

<style scoped>

body{
background-color: var(--background-color);
}

/* Search Bar */
.search-container {
    width: 100%;
    margin: 20px 0;
    padding: 10px;
  }

  .search-bar {
    width: 100%;
    max-width: 600px;
    margin: 0 auto;
    display: flex;
    box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    border-radius: 24px;
    overflow: hidden;
  }

  .search-input {
    flex: 1;
    padding: 12px 20px;
    /* border: 1px solid var(--btn-color-2); */
    border-right: none;
    border-radius: 24px 0 0 24px;
    font-size: 16px;
    outline: none;
    background-color: var(--search-bar-bg-color);
    color: var(--search-bar-text-color);
    
  }
  .search-input::placeholder {
    color:var(--search-bar-text-color);
  }

  .search-button {
    padding: 12px 24px;
    /* background: var(--btn-color-3); */
    /* color: var(--btn-text-color); */
    background-color: var(--search-bar-bg-color);
    color: var(--search-bar-text-color);
    border: none;
    cursor: pointer;
    border-radius: 0 24px 24px 0;
  }
/* Add/modify these styles in your <style> section */

/* Main layout grid adjustment */
.main-content .row {
display: grid;
grid-template-columns: 3fr 2fr;
gap: 30px;
}

/* Card header styling */
.card-header {
display: flex;
justify-content: space-between;
align-items: center;
margin-bottom: 20px;
}

.card-header h2 {
font-size: 1.5rem;
color: var(--primary-text-color);
}

.viewmore-btn button {
padding: 8px 16px;
display:flex;
flex-direction: row;
justify-content: space-between;
align-items:center;
gap: 5px;
background: var(--view-more-btn-bg-color);
color: var(--view-more-btn-text-color);
border: none;
border-radius: 16px;
cursor: pointer;
font-size: 14px;
}

.right-content {
  padding: 20px;
  border-radius: 8px;
  background: var(--section-bg-color);
  margin: 0 1.2rem 0 1.2rem;
}


/* Adjust grid layout for different screen sizes */
@media (min-width: 768px) {
.main-content .row {
  /* grid-template-columns: 1fr 300px; */
  grid-template-columns: 3fr 2fr;
}

.left-content {
  order: 1;
  padding-left:1.2rem;
}

.right-content {
  order: 2;
  margin-bottom: 30px;
}
}

@media (max-width: 767px) {
.main-content .row {
  grid-template-columns: 1fr;
}

.left-content {
  order: 2;
  margin: 0 1.2rem 0 1.2rem;
}

.right-content {
  order: 1;
}
}

/* Card body styling */
.card-body {
border-radius: 8px;
padding: 20px;
margin-bottom: 30px;
background-color: var(--section-bg-color);

}

/* Novel grid for horizontal layouts */
.novel-list {
display: grid;
grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
gap: 20px;
}

/* Random novels section */
.random-novels {
margin-top: 30px;
padding: 20px;
background: var(--section-bg-color);
border-radius: 8px;
box-shadow: 0 2px 4px rgba(0,0,0,0.1);
margin: 0 1.2rem 0 1.2rem;
}


.novel-card-vertical {
margin: 16px 0;
position: relative;
overflow: hidden;
border-radius: 8px;
background-color: var(--section-bg-color-2);
}

.novel-card-container {
position: relative;
display: flex;
flex-direction: column;
align-items: center;
justify-content: flex-start;
overflow: hidden;
width: 100%;
height: 100%;
}

.novel-background {
position: absolute;
top: 0;
left: 0;
right: 0;
bottom: 0;
background-size: cover;
background-position: center;
filter: blur(5px); /* Apply blur only to the background */
transform: scale(1.2); /* Slight zoom for the background effect */
z-index: 1;
}

.novel-content {
position: relative;
z-index: 2; /* Content appears above the blurred background */
display: flex;
flex-direction: column;
align-items: center;
justify-content: space-between;
padding: 16px;
width:100%;
height:100%;
}

.novel-cover-vertical {
max-width: 100px;
height: auto;
margin: 16px 0;
border-radius: 8px;
}

.novel-info {
text-align: center;
background: rgba(0, 0, 0, 0.7); /* Overlay for readability */
padding: 16px;
border-radius: 8px;
color: white;
width:100%;
}

.novel-title {
margin: 0;
font-size: 1.5rem;
font-weight: bold;
}

.novel-secondary-text {
margin: 8px 0;
font-size: 1rem;
color: #ccc;
}

.novel-description {
  margin: 8px 0;
  font-size: 0.9rem;
  max-height: 4rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: break-spaces;
  -moz-white-space: break-spaces;
}

.novel-action {
background: #6200ee;
color: white;
border: none;
padding: 8px 16px;
border-radius: 4px;
cursor: pointer;
font-size: 1rem;
}

.novel-action:hover {
background: #3700b3;
}

/* Updates for the Latest Trending section */

.novel-list-vertical {
  max-height: 115vh;
  overflow-y: scroll;
  scrollbar-width: 2px;
  scrollbar-color:  var(--btn-color-3) transparent;
  /* display: flex;
  flex-direction: column;
  gap: 2rem; */
}
/* .novel-list-vertical::-webkit-scrollbar {
width:10px;

}
.novel-list-vertical::-webkit-scrollbar-track {
background: transparent;
}
.novel-list-vertical::-webkit-scrollbar-thumb {
background-color: var(--section-bg-color-2);
} */

@media (max-width: 767px) {
.novel-list-vertical {
  max-width: 100%;
  padding-left: 2rem;
  padding-right: 2rem;
}
.novel-card-container {
  /* max-width: 90%; */
  margin-left: auto;
  margin-right: auto;
}


/* .novel-card-vertical {
  padding: 16px;
}
 */
.novel-title {
  font-size: 1.3rem;
}
}


/* Right Content Grid Layout */
.right-content {
padding: 20px;
border-radius: 8px;
background: var(--section-bg-color);
margin: 0 1.2rem;
margin-bottom:30px;
}

.novel-list-vertical {
display: grid;
grid-template-columns: 1fr; /* Default to 1 column */
gap: 20px;
max-height: 115vh;
overflow-y: auto;
scrollbar-width: thin;
scrollbar-color: var(--btn-color-3) transparent;
}

/* For larger screens (e.g., tablets, desktops) */
@media (min-width: 900px) {
.novel-list-vertical {
  grid-template-columns: 1fr 1fr; /* 2 columns on wider screens */
}
}

/* Card styling adjustments for grid layout */
.novel-card-vertical {
margin: 0;
position: relative;
overflow: hidden;
border-radius: 8px;
background-color: var(--section-bg-color-2);
display: flex;
flex-direction: column;
align-items: center;
}

/* .novel-card-container {
position: relative;
display: flex;
flex-direction: column;
align-items: center;
justify-content: flex-start;
overflow: hidden;
margin: 0;
padding: 16px;
max-width: 100%;
} */

</style>