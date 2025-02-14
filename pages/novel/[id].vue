<template>
    <div class="min-h-screen  pb-8">
      <!-- Show a loading spinner while fetching -->
      <!-- <div v-if="novel" class="flex justify-center items-center h-screen"> -->
        <LoadingAnimation v-if="pending"></LoadingAnimation>
      <!-- </div> -->
      <!-- Main Content -->
      <div v-else>
        <!-- Hero Section with Novel Info -->
        <div class="">
          <div class="max-w-7xl mx-auto px-4 py-6">
            <div class="flex flex-wrap lg:flex-nowrap gap-6">
              <!-- Cover Image -->
              <div class="w-48 h-64 flex-shrink-0">
                <img 
                  :src="novel.coverImage" 
                  :alt="novel.title"
                  class="w-full h-full object-cover rounded-lg shadow-md"
                />
              </div>
    
              <!-- Novel Info -->
              <div class="flex-1">
                <h1 class="text-2xl sm:text-3xl md:text-4xl text-[--primary-text-color] font-[500] mb-2">{{ novel.title }}</h1>
                <h2 class="text-lg sm:text-xl text-[--primary-text-color] mb-4">{{ novel.author }}</h2>
                <!-- <h1 class="text-2xl font-[500] mb-2">{{ novel.title }}</h1> -->
                <h2 v-if="novel.originalTitle" class="text-lg text-[--primary-text-color] mb-4">{{ novel.originalTitle }}</h2>
                <!-- <h2 class="text-lg text-[--novel-about-secondary-text-color] text-pacity-100 mb-4">{{ novel.author }}</h2> -->
                
                <div class="flex items-center gap-6 mb-4">
                  <div class="flex items-center gap-2">
                    <BookOpen name="lucide:book-open" class="w-5 h-5 text-[--icon-color-4]" />
                    <span class="text-[--primary-text-color]">{{ novel.chapters }} Chapters</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Eye name="lucide:eye" class="w-5 h-5 text-[--icon-color-4]" />
                    <span class="text-[--primary-text-color]">{{ novel.views  }} Views</span>
                  </div>
                  <div class="flex items-center gap-2">
                    <Users name="lucide:users" class="w-5 h-5 text-[--icon-color-4]" />
                    <span class="text-[--primary-text-color]">{{ novel.reads  }} Readers</span>
                  </div>
                </div>
    
                <div class="flex items-center gap-2 mb-4">
                    <div class="flex">
                    <div v-for="i in 5" :key="'star-' + i">
                      <Star 
                        v-if="i <= novel.rating" 
                        class="w-5 h-5 text-yellow-400" 
                      />
                      <StarOff 
                        v-else 
                        class="w-5 h-5 text-gray-300" 
                      />
                    </div>
                  </div>
  
  
                  <span class="text-lg font-semibold">{{ novel.reviews }}</span>
                  <span class="text-gray-500">({{ novel.reviewCount || 1}} reviews)</span>
                </div>
                <div class="flex flex-wrap gap-3">
                    <button v-if="lastReadChapter > 1" @click="goToChapter(lastReadChapter)" class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base md:text-lg sm:px-4 md:px-6">
                        Continue Reading
                        </button>
                        <button v-else  @click="goToChapter(1)" class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base md:text-lg sm:px-4 md:px-6">
                        Start Reading
                        </button>

                        <div v-if="user.loggedIn">
                          <!-- Show Add button if the novel is not in the library -->
                          <button v-if="inLibrary === false" @click="addToLibrary(novel.id)" class="px-6 py-2 border bg-[--btn-color-4] text-[--btn-text-color] rounded-md">
                            Add to Library
                          </button>
                          <!-- Show Remove button if the novel is in the library -->
                          <button v-if="inLibrary === true" @click="removeFromLibrary(novel.id)" class="px-6 py-2 border bg-[--btn-color-4] text-[--btn-text-color] rounded-md">
                            Remove
                          </button>
                        </div>
                  </div>
               <!-- Management Buttons -->

              </div>
            </div>
          </div>
        </div>
  
    
        <!-- Navigation Tabs -->
        <div class="max-w-7xl mx-auto px-4 mt-6">
          <div class="flex border-b">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="[
                'px-6 py-3 font-medium',
                activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-[--primary-text-color]'
              ]"
            >
              {{ tab.name }}
            </button>
          </div>
    
          <!-- Tab Content -->
          <div class="mt-6">
            <!-- About Tab -->
            <div v-if="activeTab === 'about'" class="grid grid-cols-1 gap-6 lg:grid-cols-12">
              <div class="lg:col-span-8 order-1 lg:order-1">
                <div class="bg-[--card-bg-color] novel-summary-card rounded-lg shadow p-6">
                  <h2 class="text-xl font-[500] text-[--primary-text-color] mb-4">Novel Summary</h2>
                  <div class="space-y-4">
                    <Tags/>
                    <div class="flex flex-wrap gap-2 mb-4">
                      <span 
                        v-for="tag in novel.tags" 
                        :key="tag"
                        class="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                      > 
                      <div>
                          {{ titleCase(tag.name) }}
                      </div>
                      </span>
                    </div>
                    <p class="text-[--primary-text-color] leading-relaxed" v-html="novel.summary"></p>
                  </div>
                </div>
              </div>
    
                <!-- Similar Novels -->
              <div class="lg:col-span-8 order-3 lg:order-3">
                <div class="chapter-list-item bg-[--foreground-color] p-4 hover:bg-[--section-bg-color]">
                  <h2 class="text-xl font-[500] text-[--primary-text-color] mb-4">Similar Novels</h2>
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div v-for="novel in similarNovels" :key="novel.id" class="space-y-2">
                      <img 
                        :src="novel.coverImage" 
                        :alt="novel.title"
                        class="w-full aspect-[3/4] object-cover rounded-md"
                      />
                      <h3 class="font-medium line-clamp-2">{{ novel.title }}</h3>
                      <div class="flex items-center text-sm text-gray-500">
                        <!-- <Icon 
                          :name="novel.status === 'Ongoing' ? 'lucide:loader' : 'lucide:check'" 
                          class="w-4 h-4 mr-1"
                        /> -->
                        {{ novel.status }}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
    
              <!-- Novel Details Sidebar -->
              <div class="lg:col-span-4 order-2 lg:order-2 space-y-6">
                <div class="bg-[--card-bg-color] details-card rounded-lg shadow p-6">
                  <h2 class="text-lg font-[500] text-[--primary-text-color] mb-4">Details</h2>
                  <div class="space-y-4">
                    <div class="flex justify-between">
                      <span class="font-[400] text-[--primary-text-color]">Status</span>
                      <span class="text-[--primary-text-color]">{{ novel.status }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="font-[400] text-[--primary-text-color]">Author</span>
                      <span class="text-[--primary-text-color]">{{ novel.author }}</span>
                    </div>
                    <div class="flex justify-between">
                      <span class="font-[400] text-[--primary-text-color]">Genre</span>
                      <!-- <span>{{ novel.genre }}</span> -->
                      <div class="flex flex-wrap gap-2 mb-4">
                        <NuxtLink
                          v-for="genre in novel.genres"
                          :key="genre.id"
                          :to="`/search?genres=${genre.name}`"
                          class="px-3 py-1 bg-[--tag-bg-color] text-[--tag-text-color] rounded-full text-sm hover:bg-[--tag-bg-color-hover] hover:text-[--tag-text-color-hover] transition-colors"
                        >
                          {{ titleCase(genre.name) }}
                        </NuxtLink>
                      </div>
                    </div>
                    <div class="flex justify-between">
                      <span class="font-[400] text-[--primary-text-color]">Rankings</span>
                      <div class="space-y-1 text-right">
                        <div class="light:font-[400] dark:font-extralight text-[--primary-text-color]" >Weekly #{{ novel.weeklyRank }}</div>
                        <div class="light:font-[400] dark:font-extralight text-[--primary-text-color]" >Monthly #{{ novel.monthlyRank }}</div>
                        <div class="light:font-[400] dark:font-extralight text-[--primary-text-color]" >All Time #{{ novel.allTimeRank }}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
    
            <!-- Table of Contents Tab -->
            <div v-if="activeTab === 'chapters'" class="bg-[--card-bg-color] novel-summary-card rounded-lg shadow">
            <div class="p-4 border-b">
              <div class="flex justify-between items-center">
                <h2 class="text-xl text-[--primary-text-color] font-[500]">Chapters</h2>
                <div class="flex gap-2">
                  <!-- <input
                    v-model="searchQuery"
                    type="number"
                    placeholder="Search Chapter #"
                    class="px-4 py-2 text-sm border rounded-md focus:ring focus:ring-blue-200"
                  /> -->
                  <button @click=latest :disabled="isLatestDisabled" :class="['px-4 py-2 text-sm border rounded-md', isLatestDisabled ? 'bg-gray-300 text-[--novel-about-secondary-text-color] text-pacity-100' : 'bg-blue-600 text-white']" class="hover:bg-gray-50 hover:text-blue-800">
                    Latest
                  </button>
                  <button @click=first :disabled="isFirstDisabled" :class="['px-4 py-2 text-sm border rounded-md', isFirstDisabled ? 'bg-gray-300 text-[--novel-about-secondary-text-color] text-pacity-100' : 'bg-blue-600 text-white']" class="hover:bg-gray-50 hover:text-blue-800">
                    First
                  </button>
                </div>
              </div>
            </div>
            <div class="divide-y">
              <div
                v-for="chapter in currentChapters"
                :key="chapter.id"
                @click="goToChapter(chapter.chapterNumber)"
               class="p-4 bg-[--primary-button-bg-color] hover:bg-[--primary-button-bg-color-hover] flex justify-between items-center cursor-pointer"
              >
                <span class="text-[--primary-text-color]" >Chapter {{ chapter.chapterNumber }}: {{ chapter.title }}</span>
                <span class="text-[--primary-text-color]">{{ formatDate(chapter.uploadedAt) }}</span>
              </div>
            </div>
            <!-- Pagination Controls -->
            <div class="p-4 flex justify-center items-center gap-2">
              <button
                :disabled="pagination.currentPage === 1"
                @click="goToPage(pagination.currentPage-1)"
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
                  pagination.currentPage === page ? 'bg-blue-100 font-[500]' : ''
                ]"
              >
                {{ page }}
              </button>
              <button
                :disabled="pagination.currentPage === pagination.totalPages"
                @click="goToPage(pagination.currentPage+1)"
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
    
            <!-- Reviews Tab -->
            <div v-if="activeTab === 'reviews'" class="bg-white rounded-lg shadow p-6">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl font-[500]">Reviews</h2>
                <button class="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Write Review
                </button>
              </div>
              <div class="space-y-6">
                <div v-for="review in novel.reviews" :key="review.id" class="border-b pb-6">
                  <div class="flex justify-between items-start mb-2">
                    <div class="flex items-center gap-2">
                      <img 
                        :src="review.userAvatar" 
                        :alt="review.userName"
                        class="w-10 h-10 rounded-full"
                      />
                      <div>
                        <div class="font-medium">{{ review.userName }}</div>
                        <div class="text-sm text-gray-500">{{ review.date }}</div>
                      </div>
                    </div>
                    <div class="flex">
                      <!-- <Icon 
                        v-for="i in 5" 
                        :key="i"
                        :name="i <= review.rating ? 'lucide:star' : 'lucide:star-off'" 
                        class="w-4 h-4" 
                        :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
                      /> -->
                    </div>
                  </div>
                  <p class="text-[--novel-about-secondary-text-color] text-pacity-100">{{ review.content }}</p>
                </div>
              </div>
            </div>
  
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { Container, Draggable } from 'vue3-smooth-dnd';
  import { ref, reactive, computed, onMounted, watch } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { BookOpen, Eye, Users, Star, StarOff, Pencil, FileX, Trash, Tags, Tag  } from 'lucide-vue-next';
  import { getSessionToken, getApiKey } from '../utils/utils';
  import { useSmartFetch } from '~/composables/useSmartFetch'
 
  import LoadingAnimation from '~/components/LoadingAnimation.vue';
import { storeToRefs } from 'pinia';
      const params = useRoute().params;
      const router = useRouter();
      const { $store, $fetchWithCache } = useNuxtApp();
      const user = useUserStore()
      const {loggedIn} = storeToRefs(user)
      const webModeStore = useWebModeStore()
      var API;
      const config = useRuntimeConfig().public
      if( webModeStore.webMode === "Safe"){
        API = config.baseSafeAPI
      }else if(webModeStore.webMode === "Pirate"){
        API = config.basePriateAPI
      }else{
        API = config.baseSafeAPI
      }
      const headers = ref(await $store.getNormalHeaders())
      const isLatestDisabled = ref(false);
      const isFirstDisabled = ref(true);
      const inLibrary = ref(false)
      const bookmark = ref(null);
      const activeTab = ref('about');
      const tabs = [
      { id: 'about', name: 'About' },
      { id: 'chapters', name: 'Table of Contents' },
      { id: 'reviews', name: 'Reviews' },
      ];

      // Watch the activeTab and run getAllDrafts if activeTab is 'drafts'
      watch(activeTab, async(newTab) => {
        if(newTab === 'chapters'){
          fetchChapters()
        }else if(newTab === "reviews"){
          fetchReviews()
        }
      })

      const fetchReviews = async()=>{
        return null
      }

      const pagination = ref({
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 20,
      });
      const currentChapters = ref([])
      const similarNovels = ref([]);

      const goTo = (path) =>{
        console.log(path)
        router.push(path)
      };
  
   
      const fetchChapters = async(page = 1, limit = 20) => {
        try {
          const data = await $fetchWithCache(`${API}novels/${params.id}`,{
            params:{
              page,
              limit,
              query:"pub"
            },
          },100000,true);
          if (data.statusCode === 200) {
            currentChapters.value = data.body.chapters;
            pagination.value = {
              totalItems: data.body.pagination.totalItems,
              totalPages: data.body.pagination.totalPages,
              currentPage: data.body.pagination.currentPage,
              pageSize: data.body.pagination.pageSize,
            };
          } else {
            console.error(data.message);
          }
        } catch (error) {
          console.error('Error fetching chapters:', error);
        }finally{
          if(isReverse.value){
            toggleChapterOrder(false)
          }
        }
      };
      const isReverse = ref(false);
  
      const toggleChapterOrder = (change=true) => {
        if(change){
          isReverse.value = !isReverse.value
        }
        currentChapters.value.reverse();
      };
      const fetchNovel = async () => {
        const response = await $fetch(`${API}metadata/novel/${params.id}`,
            {
              method: 'GET',
              headers: headers.value,
            })
        if(response.statusCode != 200){
            router.push(`/novel/${params.id}`)
        }else{
            novel.value = response.body;
        }
      };
        

const {data, pending, error} = useSmartFetch(`${API}metadata/novel/${params.id}`,{
  method: 'GET',
  headers: headers.value,
  enableCache: true,
  cacheTime: 60000,
})

const novel = computed(()=>{
  return data.value?.body.novel
})
watch(data, (newData) => {
  if (newData && newData.body) {
    // Update our mutable library state with the value from the backend
    inLibrary.value = newData.body.inLibrary
  }
})

const backendBookmarks = computed(()=>{
  return data.value?.body.bookmarks
})
const readingHistory = computed(()=>{
  return data.value?.body.readingHistory
})
//if book is not stored in library bookmark wil be null. so in this case localforage will supply us with bookmarkchapter
const bookmark_num = await $store.getLastReadChapter(parseInt(params.id));
const cached_num_of_chapters = await $store.getNumberOfChapters(params.id);
const lastReadChapter = computed(()=>{
  if(readingHistory.value){
    return Math.max(bookmark_num, readingHistory.value?.lastReadChapter)
  }else{
    return bookmark_num
  }
})  
if (!backendBookmarks.value) {
  bookmark.value = {
    bookmarkedChapters: await $store.getBookmarks(parseInt(params.id)),
    lastReadChapter: parseInt(bookmark_num)
  }
}

watch(pending, (newPending) => {
  if (!newPending && novel.value) {
    console.log('Novel:', novel.value)
    // Now you can compare cached number of chapters and update the store:
    if (cached_num_of_chapters !== novel.value?.chapters) {
      $store.setNumberOfChapters(novel.value?.id, novel.value?.chapters)
      $store.setChapters(novel.value?.id, novel.value?.chapterList)
    }
  }
})

      // onMounted(async() => {
      //   const headers = await $store.getNormalHeaders()
      //   const data = await $fetch(`${API}metadata/novel/${params.id}`,{
      //       headers: headers
      //   });
      //   novel.value = data.body.novel;
      //   inLibrary.value = data.body.inLibrary;
      //   bookmark.value = data.body.bookmark;


      //   //if book is not stored in library bookmark wil be null. so in this case localforage will supply us with bookmarkchapter
      //   const bookmark_num = await $store.getBookmark(novel.value.id);
      //   const cached_num_of_chapters = await $store.getNumberOfChapters(novel.value.id);
      //   if (!bookmark.value) {
      //     bookmark.value = {
      //       bookmarkedChapter: parseInt(bookmark_num),
      //       lastReadChapter: parseInt(bookmark_num)
      //     }
      //   }
      //   if(cached_num_of_chapters !== novel.value.chapters){
      //       $store.setNumberOfChapters(novel.value.id, novel.value.chapters);
      //       console.log(novel.value.chapterList)
      //       $store.setChapters(novel.value.id, novel.value.chapterList);
      //   }
      //   console.log(bookmark.value.bookmarkedChapter)
      //   // fetchChapters(pagination.value.currentPage, pagination.value.pageSize)
      // });

      const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Intl.DateTimeFormat('en-US', options).format(date);
      };
  
      const latest = () => {
        currentChapters.value.reverse();
        isLatestDisabled.value = true;
        isFirstDisabled.value = false;
      };

      const first = () => {
        currentChapters.value.reverse();
        isLatestDisabled.value = false;
        isFirstDisabled.value = true;
      };

  
      function goToChapter(chapter_num) {
        router.push(`/novel/${params.id}/chapter/${chapter_num}`);
      }
      const goToPage = async (page) => {
        if (page < 1 || page > pagination.value.totalPages) {
          console.error('Invalid page number');
          return;
        }

        try {
          // Fetch the chapters for the selected page
          await fetchChapters(page, pagination.value.pageSize);
          pagination.value.currentPage = page;
        } catch (error) {
          console.error('Error navigating to page:', error);
        }
      };

      //TODO add support for local bookmark getting passed here
      async function addToLibrary(novel_id){
        const headers = await $store.getNormalHeaders()
        const userId = await $store.getUserId()
        const data = await $fetch(`${API}user/${userId}/library`,{
            method : "PUT",
            headers: headers,
            body: JSON.stringify({novel_id: novel_id})
        })
        inLibrary.value = data.body.inLibrary
        bookmark.value = data.body.bookmark
      }
      async function removeFromLibrary(novel_id){
        const headers = await $store.getNormalHeaders()
        const userId = await $store.getUserId()
        const data = await $fetch(`${API}user/${userId}/library`,{
            method : "DELETE",
            headers: headers,
            body: JSON.stringify({novel_id: novel_id})
        })
        inLibrary.value = data.body.inLibrary
      }

      const showAllChapters = async () => {
        try {
          // Fetch all chapters without pagination
          await fetchChapters(1, parseInt(novel.value.chapters)+1);
        } catch (error) {
          console.error('Error fetching all chapters:', error);
        }
      };

</script>
  
  <style scoped>
  button {
    font-size: 0.875rem; /* Default (small screens) */
    padding: 0.5rem 1rem;
  }
  
  @media (min-width: 768px) {
    button {
      font-size: 1rem; /* Medium screens */
      padding: 0.75rem 1.25rem;
    }
  }
  
  @media (min-width: 1024px) {
    button {
      font-size: 1.125rem; /* Large screens */
      padding: 1rem 1.5rem;
    }
  }xz
  .smooth-dnd-container {
    min-height: 30px;
  }
  .smooth-dnd-draggable-wrapper {
    overflow: visible;
  }
  </style>
  