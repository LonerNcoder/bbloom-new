<template>
    <div id="rootpage">
      <LoadingAnimation v-if="pending"/>
      <div v-if="error">{{ error }}</div>
      <div v-else>
    <div>
      <div class="home-container">
        <!-- Search bar stays the same -->
        <div class="search-container">
          <div class="search-bar">
            <input type="text" class="search-input" v-model="searchQuery" @keyup.enter="goToSearch" placeholder="Search novels...">
            <button class="search-button" @click="goToSearch" >Search</button>
          </div>
        </div>

        <div class="w-full h-[140%] px-8">
          <SplitterGroup direction="vertical">
            <SplitterPanel>
              <SplitterGroup id="splitter-group-1" direction="horizontal">
                <SplitterPanel id="splitter-group-1-panel-1" :min-size="10" class="rounded-xl">
                    <SplitterGroup id="splitter-group-2" direction="vertical" class="flex justify-between" >
                        <SplitterPanel id="splitter-group-2-panel-1" :min-size="10" class="block" >
                            <div class="card">
                                <section class="classic-series card-body">
                                <div class="card-header">
                                    <h2>Classic Series</h2>
                                    <a class="viewmore-btn">
                                    <button @click="viewMore('classicSeries')">View More</button>
                                    </a>
                                </div>
                                <NovelsGrid class="novel-list">
                                    <NovelCard 
                                    v-for="novel in novels" 
                                    :key="novel.id" 
                                    :novel="novel" 
                                    :to="`/novel/${novel.id}`" 
                                    />
                                </NovelsGrid>
                                </section>
                            </div>

                        </SplitterPanel>
                        <SplitterResizeHandle id="splitter-group-2-resize-handle-1" class="h-2">

                        </SplitterResizeHandle>
                        <SplitterPanel  id="splitter-group-2-panel-2" :min-size="10" class="block" >
                            <div class="card">
                            <section class="originals card-body">
                            <div class="card-header">
                                <h2>Originals</h2>
                                <a class="viewmore-btn">
                                <button @click="viewMore('originalsSeries')">View More</button>
                                </a>
                            </div>
                            <NovelsGrid class="novel-list">
                                <NovelCard 
                                v-for="novel in novels" 
                                :key="novel.id" 
                                :novel="novel" 
                                :to="`/novel/${novel.id}`" 
                                />
                            </NovelsGrid>
                            </section>
                        </div>
                        </SplitterPanel>
                    </SplitterGroup>
                </SplitterPanel>
                <SplitterResizeHandle id="splitter-group-2-resize-handle-1" class="w-2" />
                <SplitterPanel id="splitter-group-1-panel-2"  :min-size="20" class="rounded-xl">
                    <div class="right-content">
                        <section>
                            <div class="card-header">
                                <h2>Latest Trending</h2>
                                <a class="viewmore-btn">
                                <button @click="viewMore('trendingSeries')">View More</button>
                                </a>
                            </div>
                            <div class="novel-list-vertical">
                            <!-- <div v-for="novel in novels" :key="novel.id" class="novel-card-vertical"> -->
                <!-- Card Container -->
                    <div v-for="novel in novels" :key="novel.id" class="novel-card-vertical">
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
                            <button class="novel-action">Read More</button>
                            </div>
                        </div>
                    </div>
                    </div>
                            
                            </div>
                        </section>
                        </div>

                </SplitterPanel>
              </SplitterGroup>        
            </SplitterPanel>
            <SplitterResizeHandle></SplitterResizeHandle>
            <SplitterPanel>
                <!-- Random novels section -->
                <section class="random-novels">
                <div class="card-header">
                <h2>Random Novels</h2>
                <a class="viewmore-btn">
                          <button @click="viewMore('randomSeries')">Shuffle</button>
                        </a>
                </div>
                <div class="novel-list vertical-list">
                  <NovelCard 
                    v-for="novel in novels" 
                    :key="novel.id" 
                    :novel="novel" 
                    :to="`/novel/${novel.id}`" 
                  />
                </div>
              </section>
            </SplitterPanel>
          </SplitterGroup>
          </div>
      </div>
    </div>
    </div>
  </div>
  </template>
  
  <script setup>
  import { ref, computed, onMounted } from 'vue'
  import { useSmartFetch } from '~/composables/useSmartFetch'
  import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from 'radix-vue'
  const {$store} = useNuxtApp()
  const router = useRouter();
  
  
  // Reactive state
  const searchQuery = ref('')
  const headers = await $store.getNormalHeaders()
  const { data, pending, error } = useSmartFetch('${API}novels', {
    enableCache: true,
    cacheTime: 60000,
    headers: headers
  })
  
  // Computed properties
  const novels = computed(() => data.value?.novels || [])
  const filteredclassicSeries = computed(() => 
    novels.value.filter(n => n.category === 'classicSeries' && n.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
  const filteredoriginals = computed(() => 
    novels.value.filter(n => n.category === 'originals' && n.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
  const filteredRandomNovels = computed(() => 
    novels.value.filter(n => n.category === 'randomNovels' && n.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
  const filteredRanking = computed(() => 
    novels.value.filter(n => n.category === 'novelsRanking' && n.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
  )
  
  
  // Methods
  const viewMore = (category) => {
    router.push({
      path: '/search',
      query: {
        genre: category,
        limit: 30
      }
    })
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
        border: 1px solid var(--btn-color-2);
        border-right: none;
        border-radius: 24px 0 0 24px;
        font-size: 16px;
        outline: none;
        background-color: var(--section-bg-color-2);
        color: var(--btn-text-color);
        
      }
      .search-input::placeholder {
        color:var(--btn-text-color);
      }
  
      .search-button {
        padding: 12px 24px;
        background: var(--btn-color-3);
        color: var(--btn-text-color);
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
    font-size: 24px;
    color: var(--primary-text-color);
  }
  
  .viewmore-btn button {
    padding: 8px 16px;
    background: var(--btn-color-3);
    color: var(--btn-text-color);
    border: none;
    border-radius: 16px;
    cursor: pointer;
    font-size: 14px;
  }
  
  .right-content {
      padding: 20px;
      border-radius: 8px;
      background: var(--section-bg-color);
    /*  margin: 0 1.2rem 0 1.2rem; */
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
      /* margin-bottom: 30px; */
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
    /* margin-bottom: 30px; */
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
    max-width: 70%;
    margin-top: 2rem;
    margin-left: auto;
    margin-right: auto;
    margin-bottom: 2rem;
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
    justify-content: flex-start;
    padding: 16px;
    width:100%;
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
      max-width: 90%;
      margin-left: auto;
      margin-right: auto;
  }
  
    
    .novel-card-vertical {
      padding: 16px;
    }
    
    .novel-title {
      font-size: 1.3rem;
    }
  }
  </style>