<template>
  <LoadingAnimation v-if="loading"></LoadingAnimation>
  <div>
    <AdvancedSearch @search="handleSearch"></AdvancedSearch>
          <main class="main-content">
              <div class="row">
                  <div class="left-content">
                    <div class="card">
                      <section class="classic-series card-body">
                          <div class="card-header">
                            <h2>{{ 'Classic Series'}}</h2>
                            <a class="viewmore-btn" ><button @click="viewMore('classicSeries')">{{ 'viewMore' }}</button></a>
                          </div>
                          
                          <!-- <div class="novel-list horizontal">
                            <NovelCard v-for="novel in novels" :key="novel.id" :novel="novel" :to="`/novel/${novel.id}`" />
                          </div> -->

                          <NovelsGrid class="novel-list">
                            <NovelCard v-for="novel in novels" :key="novel.id" :novel="novel" :to="`/novel/${novel.id}`" />
                          </NovelsGrid>
                                                  
                      </section>

                    </div>
                  
            <div class="card">
                <section class="originals card-body">
                  <div class="card-header">
                          <h2>{{ 'Originals'}}</h2>
                          <a class="viewmore-btn" ><button @click="viewMore('originalsSeries')">{{ 'viewMore' }}</button></a>
                      </div>
                    
                    <!-- <div class="novel-list horizontal">
                        <NovelCard v-for="novel in novels" :key="novel.id" :novel="novel" :to="`/novel/${novel.id}`" />
                    </div> -->
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
              </div>
        
                <div class="right-content">
                <section class="novels-ranking">
                    <h2>{{ 'Novels Ranking'}}</h2>
                    <div class="novel-list vertical-list">
                    <NovelCard v-for="novel in novels" :key="novel.id" :novel="novel" :to="`/novel/${novel.id}`" />
                    </div>
                    <button @click="viewMore('novelsRanking')">{{ 'viewMore'}}</button>
                </section>
        
                <section class="random-novels">
                    <h2>{{ 'Random Novels'}}</h2>
                    <div class="novel-list vertical-list">
                    <NovelCard v-for="novel in filteredRandomNovels" :key="novel.id" :novel="novel" :to="`/novel/${novel.id}`" />
                    </div>
                </section>
                </div>

              </div>

          </main>
  </div>
</template>

<script>
import NovelCard from '~/components/NovelCard.vue';
import NovelsGrid from '../components/NovelsGrid.vue';
//   import { useI18n } from '@nuxtjs/i18n'
import { ref, computed, onMounted } from 'vue';
import AdvancedSearch from '~/components/AdvancedSearch.vue';

export default {
  components: {
    NovelCard,
    NovelsGrid,
    AdvancedSearch
  },
  setup() {
    const searchQuery = ref('');

    const novels = ref([]);
    const error = ref(null);
    const loading = ref(true);

    const filteredclassicSeries = computed(() => novels.value.filter(n => n.category === 'classicSeries' && n.title.toLowerCase().includes(searchQuery.value.toLowerCase())));
    const filteredoriginals = computed(() => novels.value.filter(n => n.category === 'originals' && n.title.toLowerCase().includes(searchQuery.value.toLowerCase())));
    const filteredRandomNovels = computed(() => novels.value.filter(n => n.category === 'randomNovels' && n.title.toLowerCase().includes(searchQuery.value.toLowerCase())));
    const filteredRanking = computed(() => novels.value.filter(n => n.category === 'novelsRanking' && n.title.toLowerCase().includes(searchQuery.value.toLowerCase())));

    const filterNovels = () => {
      // filtering is done in computed properties
    }
    const viewMore = (category) => {
      // Navigate to a dedicated page for the category
      console.log("view more clicked for category", category)
    }
  // In your setup function, add:
  const handleSearch = (filters) => {
    // Apply the filters to your novels
    const filteredNovels = novels.value.filter(novel => {
      // Match search query
      if (filters.query && !novel.title.toLowerCase().includes(filters.query.toLowerCase())) {
        return false;
      }
      
      // Match status
      if (filters.status !== 'all' && novel.status !== filters.status) {
        return false;
      }
      
      // Match genres
      if (filters.genres.length > 0 && !filters.genres.some(genre => novel.genres.includes(genre))) {
        return false;
      }
      
      return true;
    });

  // Sort the results
  filteredNovels.sort((a, b) => {
    const order = filters.sortOrder === 'ascending' ? 1 : -1;
    switch (filters.sortBy) {
      case 'name':
        return order * a.title.localeCompare(b.title);
      case 'views':
        return order * (a.views - b.views);
      case 'readers':
        return order * (a.readers - b.readers);
      case 'chapters':
        return order * (a.chapters - b.chapters);
      default:
        return order * (new Date(a.additionDate) - new Date(b.additionDate));
    }
  });

  novels.value = filteredNovels;
};


    onMounted(async () => {
      try {
        const data = await $fetch('${API}novels');
        
        novels.value = data.novels;
      } catch (err) {
        error.value = err.message || 'Failed to fetch novels'; // Get error message
        console.error(err);
      } finally {
        loading.value = false;
        // await extractEPUBData("./utils/novel.epub");
      }
    });

    return {
      searchQuery,
      handleSearch,
      novels,
      filteredclassicSeries,
      filteredoriginals,
      filteredRandomNovels,
      filteredRanking,
      filterNovels,
      viewMore,
      loading
    };
  },
};
</script>

<style scoped>

.main-content {
  display: flex;
  gap: 20px;
  padding: 20px;
}
.row{
  --bs-gutter-x: 0.5rem;
  width: 66.66666667%;
}

.left-content {
  flex: 0 0 auto;
  /* width: 66.66666667%; */
}
.card{
  border: none !important;
  box-shadow: 0 4px 12px rgba(0, 0, 0, .1);
}

.card-body{
    padding: 8px; /*var(--chapter-padding); */
    position: relative;
    border: none !important;
    flex: 1 1 auto;
    max-width: 100%;
}
.card-header{
  display: flex !important;
  align-items: center !important;
}
.viewmore-btn{
  font-weight: 500;
  box-shadow: none !important;
  margin-left: auto !important;
}
.horizontal{
  display: flex;
  overflow-x: auto;
  padding: 5px 0;
}

.horizontal::-webkit-scrollbar {
    width: 8px;
    height: 8px;
}
.horizontal::-webkit-scrollbar-thumb {
    border-radius: 6px;
    border: 0 solid transparent;
    background-clip: content-box;
    background-color: #a5a5a5;
}
.right-content {
  flex: 1;
}

.vertical-list {
  flex-direction: column;
  overflow-y: auto;
  max-height: 600px;
  overflow-x: hidden;
}

.vertical-list .novel-card {
  width: 100%;
  margin-bottom: 10px;
}

.vertical-list::-webkit-scrollbar {
  width: 5px;
}

.vertical-list::-webkit-scrollbar-track {
  background: #f1f1f1;
}

.vertical-list::-webkit-scrollbar-thumb {
  background:#888;
}

.vertical-list::-webkit-scrollbar-thumb:hover {
background: #555;
}

/* .novels-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, 200px);
  gap: 20px;
  padding: 20px;
  position: relative;
} */

/* Handle expansion behavior */
@media (hover: hover) {
  .novel-card-wrapper:nth-child(n+1) {
    transform-origin: left center;
  }
  
  .novel-card-wrapper:nth-child(4n), 
  .novel-card-wrapper:nth-child(4n-1) {
    transform-origin: right center;
  }

  .novel-card-wrapper:hover .novel-card {
    transform: translateX(0);
  }

  /* Adjust expansion direction based on position in grid */
  .novel-card-wrapper:nth-child(4n) .novel-card.is-expanded,
  .novel-card-wrapper:nth-child(4n-1) .novel-card.is-expanded {
    transform: translateX(-300px);
  }
}
</style>