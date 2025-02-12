<!-- <template>
  <div>
          <main class="main-content">
              <div class="row">
                  <div class="left-content">
                    <div class="card">
                      <section class="new-series card-body">
                          <div class="card-header">
                            <h2>{{ 'New Series') }}</h2>
                            <a class="viewmore-btn" ><button @click="viewMore('newSeries')">{{ 'viewMore') }}</button></a>
                          </div>
                          
                          <div class="novel-list horizontal">
                            <NovelCard v-for="novel in novels" :key="novel.id" :novel="novel" :to="`/novel/${novel.id}`" />
                          </div>
                          
                      </section>

                    </div>
                  
            <div class="card">
                <section class="trending card-body">
                  <div class="card-header">
                          <h2>{{ 'Trending') }}</h2>
                          <a class="viewmore-btn" ><button @click="viewMore('trendingSeries')">{{ 'viewMore') }}</button></a>
                      </div>
                    
                    <div class="novel-list horizontal">
                        <NovelCard v-for="novel in novels" :key="novel.id" :novel="novel" :to="`/novel/${novel.id}`" />
                    </div>
                </section>
                </div>
              </div>
        
                <div class="right-content">
                <section class="novels-ranking">
                    <h2>{{ 'Novels Ranking') }}</h2>
                    <div class="novel-list vertical-list">
                    <NovelCard v-for="novel in novels" :key="novel.id" :novel="novel" :to="`/novel/${novel.id}`" />
                    </div>
                    <button @click="viewMore('novelsRanking')">{{ 'viewMore') }}</button>
                </section>
        
                <section class="random-novels">
                    <h2>{{ 'Random Novels') }}</h2>
                    <div class="novel-list vertical-list">
                    <NovelCard v-for="novel in filteredRandomNovels" :key="novel.id" :novel="novel" :to="`/novel/${novel.id}`" />
                    </div>
                </section>
                </div>

              </div>

          </main>
  </div>
</template> -->
<template>
  <LoadingAnimation v-if="loading"></LoadingAnimation>
  <div>
    <main class="main-content">
      <div class="row">
        <div class="left-content">
          <!-- Check if library has novels -->
          <div v-if="library">
            <div class="card">
              <section class="new-series card-body">
                <div class="card-header">
                  <h2>{{ 'New Series'}}</h2>
                  <a class="viewmore-btn">
                    <button @click="viewMore('newSeries')">{{ 'viewMore'}}</button>
                  </a>
                </div>
                <div class="novel-list horizontal">
                  <NovelCard v-for="novelObj in library" :key="novelObj.id" :novel="novelObj" :to="`/novel/${novelObj.id}/chapter/${novelObj.bookmark.bookmarkedChapter}`" :name="novelObj.bookmark?.chapterNumber > 1 ? 'Continue Reading' : 'Start Reading'" />
                </div>
              </section>
            </div>

            <div class="card">
              <section class="trending card-body">
                <div class="card-header">
                  <h2>{{ 'Trending'}}</h2>
                  <a class="viewmore-btn">
                    <button @click="viewMore('trendingSeries')">{{ 'viewMore' }}</button>
                  </a>
                </div>
                <div class="novel-list horizontal">
                  <NovelCard v-for="novelObj in library" :key="novelObj.id" :novel="novelObj" :to="`/novel/${novelObj.id}/chapter/${novelObj.bookmark.chapterNumber}`" />
                </div>
              </section>
            </div>
          </div>

          <!-- Show message if library is empty -->
          <div v-else class="empty-library-message">
            <p>{{ 'You have no books in your library.' }}</p>
          </div>
        </div>

        <div class="right-content">
          <section class="novels-ranking" v-if="library">
            <h2>{{ 'Novels Ranking'}}</h2>
            <div class="novel-list vertical-list">
              <NovelCard v-for="novelObj in library" :key="novelObj.id" :novel="novelObj" :to="`/novel/${novelObj.id}/chapter/${novelObj.bookmark.chapterNumber}`" />

            </div>
            <button @click="viewMore('novelsRanking')">{{ 'viewMore'}}</button>
          </section>

          <section class="random-novels" v-if="library">
            <h2>{{ 'Random Novels'}}</h2>
            <div class="novel-list vertical-list">
              <NovelCard v-for="novelObj in library" :key="novelObj.id" :novel="novelObj" :to="`/novel/${novelObj.id}/chapter/${novelObj.bookmark.chapterNumber}`" />

            </div>
          </section>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import NovelCard from '~/components/NovelCard.vue';
//   import { useI18n } from '@nuxtjs/i18n'
import { ref, computed, onMounted } from 'vue';
import LoadingAnimation from '~/components/LoadingAnimation.vue';
const searchQuery = ref('');
const novels = ref([]);
const loading = ref(true);
const {$store} = useNuxtApp();

const webMode = ref(await $store.getWebMode())
var API;
const config = useRuntimeConfig().public
if(webMode.value === "Safe"){
  API = config.baseSafeAPI
}else if(webMode.value === "Pirate"){
  API = config.basePriateAPI
}else{
  API = config.baseSafeAPI
}
const filterNovels = () => {
  // filtering is done in computed properties
}
const viewMore = (category) => {
  // Navigate to a dedicated page for the category
  console.log("view more clicked for category", category)
}
const headers = await $store.getNormalHeaders()
const userId = await $store.getUserId()
const {data, error} = useSmartFetch(`${API}user/${userId}/library`,{
      method: "GET",
      headers:headers
})

const library = computed(() => data.value?.body.libraryNovels || [])
onMounted(async () => {
  loading.value = false;
});

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


</style>