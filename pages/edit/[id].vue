<template>
    <div class="min-h-screen px-6 pb-8">
      <!-- Show a loading spinner while fetching -->
      <!-- <div v-if="novel" class="flex justify-center items-center h-screen"> -->
        <LoadingAnimation v-if="!novel"></LoadingAnimation>
      <!-- </div> -->
      <!-- Main Content -->
      <div  v-else>
        <!-- Hero Section with Novel Info shadow-sm -->
        <div class="">
          <div class="novel-name-author-bg max-w-7xl mx-auto px-4 py-6">
            <div class="flex flex-wrap lg:flex-nowrap gap-6">

              <NovelCoverImage :coverImage="novel.coverImage" :resetImage="resetImage" :title="novel.title" @update:image="resetCoverImg" />
              <!-- Novel Info -->
              <div class="flex-1">
                <h1 class="text-2xl sm:text-3xl md:text-4xl text-[--primary-text-color] font-[500] mb-2 flex flex-row center gap-4 flex-wrap items-center">{{ novel.title }}<Pencil @click="openModal('title', 'Edit Title', 'title')" /></h1>
                <h2 class="text-lg sm:text-xl text-[--author-name-text-color] mb-4 flex flex-row center gap-4 flex-wrap items-center">{{ novel.author }}<UserRoundPen @click="openModal('author', 'Edit Author', 'author')"/></h2>
                <!-- <h1 class="text-2xl font-[500] mb-2">{{ novel.title }}</h1> -->
                <h2 v-if="novel.originalTitle" class="text-lg text-[--primary-text-color] mb-4">{{ novel.originalTitle }}</h2>
                <!-- <h2 class="text-lg text-[--primary-text-color] mb-4">{{ novel.author }}</h2> -->
                
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
                  <button  class="px-6 py-2 bg-[--btn-color-1] text-[--btn-text-color] rounded-md text-sm sm:text-base md:text-lg sm:px-4 md:px-6">
                    <NuxtLink :to="`/edit/${novel.id}/new`">
                    New Chapter
                  </NuxtLink>
                  </button>
                  <!-- <button class="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50 text-sm sm:text-base md:text-lg sm:px-4 md:px-6">
                      <NuxtLink :to="`/edit/${novel.id}/${draftChapters[0]?.id}/draft/false`">
                        Continue Writing
                      </NuxtLink>
                  </button> -->
                  <button @click="openModal('status', 'Set Status', 'status')" class="px-6 py-2 border-[3px] border-[--btn-color-4] rounded-md hover:border-[--btn-color-3] text-sm sm:text-base md:text-lg sm:px-4 md:px-6">
                    Set Status
                  </button>

                  <ConfirmationModal  @confirm="deleteNovel" :alertTitle="'Delete This Novel?'" :alertDescription="'Are you sure you want to delete this novel?'" :alertCancel="'Cancel'" :alertConfirm="'Delete'">
                    <div class="px-4 py-2 bg-[--btn-color-4] text-[--btn-text-color] rounded-md hover:bg-red-700 text-sm md:text-base lg:text-lg lg:px-6 lg:py-3 transition-all">
                    <!-- Delete Novel -->
                     <Trash />
                    </div>
                  </ConfirmationModal>
                  <!-- <GenerateImage @final-image="resetCoverImg"></GenerateImage> -->
                </div>
               <!-- Management Buttons -->



              </div>
            </div>
          </div>
        </div>
  
        <!-- Modal Component -->
        <div v-if="isModalOpen" class="fixed inset-0 backdrop-blur-sm bg-opacity-50 flex items-center justify-center">
          <div class="bg-white rounded-lg shadow-lg w-96 p-6 sm:p-8">
            <h2 class="text-lg sm:text-xl font-[500] mb-4">{{ modalTitle }}</h2>
  
            <!-- Dynamic Input Field -->
            <div v-if="modalType === 'title' || modalType === 'author'">
              <input 
                type="text" 
                v-model="modalInput" 
                class="w-full border rounded-md p-2 mb-4" 
                placeholder="Enter new value" 
              />
            </div>
            <!-- Dynamic Input Field -->
              <div v-if="modalType === 'summary'">
              <input 
                type="textarea" 
                v-model="modalInput" 
                class="w-full border rounded-md p-2 mb-4" 
                placeholder="Enter new value" 
              />
            </div>
            <div v-if="modalType === 'genre'">
              <select v-model="modalInput" class="w-full border rounded-md p-2 mb-4">
                <option v-for="genre in genres" :key="genre" :value="genre">{{ titleCase(genre) }}</option>
              </select>
            </div>
            <div v-if="modalType === 'status'">
              <select v-model="modalInput" class="w-full border rounded-md p-2 mb-4">
                <option v-for="stat in statutypes" :key="stat" :value="stat">{{ titleCase(stat) }}</option>
              </select>
            </div>
            <div v-if="modalType === 'tags'">
              <div class="flex gap-2 mb-4">
                <input 
                  type="text" 
                  v-model="tagSearch" 
                  @input="searchTags" 
                  placeholder="Search for tags" 
                  class="flex-1 border rounded-md p-2"
                />
                <button 
                  @click="addTag" 
                  class="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Add
                </button>
              </div>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="tag in selectedTags" 
                  :key="tag" 
                  class="bg-blue-50 text-blue-600 px-2 py-1 rounded-full"
                >
                  {{ tag }}
                  <button 
                    @click="removeTag(tag)" 
                    class="ml-2 text-red-600 hover:underline"
                  >
                    x
                  </button>
                </span>
              </div>
            </div>

            <div v-if="modalType === 'genres'">
              <div class="flex gap-2 mb-4">
                <input 
                  type="text" 
                  v-model="genreSearch" 
                  @input="searchGenres" 
                  placeholder="Search for tags" 
                  class="flex-1 border rounded-md p-2"
                />
                <button 
                  @click="addGenre" 
                  class="px-4 py-2 bg-blue-600 text-white rounded-md"
                >
                  Add
                </button>
              </div>
              <div class="flex flex-wrap gap-2">
                <span 
                  v-for="genre in selectedGenres" 
                  :key="genre" 
                  class="bg-blue-50 text-blue-600 px-2 py-1 rounded-full"
                >
                  {{ genre }}
                  <button 
                    @click="removeGenre(genre)" 
                    class="ml-2 text-red-600 hover:underline"
                  >
                    x
                  </button>
                </span>
              </div>
            </div>
  
            <!-- Modal Actions -->
            <div class="flex justify-end gap-2">
              <button 
                @click="closeModal" 
                class="px-4 py-2 sm:px-6 sm:py-3 border rounded-md hover:bg-gray-100 text-sm sm:text-base"
              >
                Cancel
              </button>
              <button 
                @click="submitModal" 
                class="px-4 py-2 sm:px-6 sm:py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
  
    
        <!-- Navigation Tabs -->
        <div class="max-w-7xl mx-auto mt-6">
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
                  <h2 class="text-xl font-[500] text-[--primary-text-color] mb-4 flex flex-row center gap-4 flex-wrap items-center">Novel Summary <Pencil @click="openModal('summary', 'Edit Summary', 'summary')"/></h2>
                  <div class="space-y-4">
                    <Tags/>
                    <div class="flex flex-wrap gap-2 mb-4">
                      <span 
                        v-for="tag in novel.tags" 
                        :key="tag"
                        class="px-2 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                      > 
                        <div>
                          {{ titleCase(tag.name) }}
                        </div>
                      </span>

                      <Tickets @click="openModal('tags', 'Edit Tags', 'tags')"/>
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
                      <span class="font-[400] text-[--primary-text-color] flex flex-row center gap-4 flex-wrap items-center">Genre
                        <Pencil :size="16" @click="openModal('genres', 'Edit Genres', 'genres')" />
                      </span>
                      <!-- <span>{{ novel.genre }}</span> -->
                      <div class="flex flex-wrap gap-2 mb-4">
                        
                        <NuxtLink
                          v-for="genre in novel.genres"
                          :key="genre.id"
                          :to="`/search?genres=${genre.name}`"
                          class="px-2 py-1 bg-[--tag-bg-color] text-[--tag-text-color] rounded-full text-sm hover:bg-[--tag-bg-color-hover] hover:text-[--tag-text-color-hover] transition-colors"
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
                  <button
                    class="px-4 py-2 text-sm border rounded-md text-[--primary-text-color] hover:bg-[--secondary-button-bg-color-hover]"
                    @click="toggleChapterOrder"
                  >
                    Order
                  </button>
                  <!-- <button
                    class="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
                    @click="filterChapters('first')"
                  >
                    First
                  </button> -->
                </div>
              </div>
            </div>
            <div class="divide-y">
              <div
                v-for="(chapter, index) in currentChapters"
                :key="chapter.id"
                class="p-4 bg-[--primary-button-bg-color] hover:bg-[--primary-button-bg-color-hover] flex justify-between items-center cursor-pointer"
              >
                <span class="text-[--primary-text-color]" >Chapter {{ pagination.pageSize*(pagination.currentPage-1) + index + 1 }}: {{ chapter.title }}</span>
                <span class="text-gray-500 text-sm">{{ formatDate(chapter.uploadedAt) }}</span>
                <div class="flex gap-2">
                  <button
                    @click="goTo(`/edit/${novel.id}/${chapter.id}/pub/false`)"
                    class="px-2 py-1 text-sm border rounded-md bg-[--btn-color-4] text-[--btn-text-color] "
                  >
                    <Pencil />
                  </button>
                  <button
                    @click="deleteChapterMode(chapter.id, 'pub')"
                    class="px-2 py-1 text-sm border bg-[--btn-color-4] text-[--btn-text-color] rounded-md hover:bg-red-700"
                  >
                    <FileX />
                  </button>
                </div>
              </div>
            </div>
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
                  pagination.currentPage === page ? 'bg-blue-100 font-[500]' : ''
                ]"
              >
                {{ page }}
              </button>
              <button
                :disabled="pagination.currentPage === pagination.totalPages || pagination.currentPage == -1"
                @click="goToPage(parseInt(pagination.currentPage+1))"
                class="px-4 py-2 text-sm border rounded-md hover:bg-gray-50 disabled:opacity-50"
              >
                Next
              </button>
              <button
              :class="[
                  'px-4 py-2 text-sm border rounded-md hover:bg-gray-50',
                  pagination.currentPage == -1 ? 'bg-blue-100 font-[500]' : ''
                ]"
                @click="showAllChapters"
                class="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
              >
                View All
              </button>
            </div>
          </div>
    
            <!-- Reviews Tab -->
            <div v-if="activeTab === 'reviews'" class="novel-summary-card bg-[--card-bg-color]  rounded-lg shadow p-6">
              <div class="flex justify-between items-center mb-6">
                <h2 class="text-xl text-[--primary-text-color] font-[500]">Reviews</h2>
                <button class="px-4 py-2 bg-[--btn-color-3] text-[--btn-text-color] rounded-md">
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
                  <p class="text-[--primary-text-color]">{{ review.content }}</p>
                </div>
              </div>
            </div>
  
  <!-- Unpublished Chapters Tab -->
  <div v-if="activeTab === 'unpublished'" class="bg-[--card-bg-color] novel-summary-card  rounded-lg shadow">
    <div class="p-4 border-b">
      <div class="flex justify-between items-center">
        <h2 class="text-xl text-[--primary-text-color] font-[500]">Unpublished Chapters</h2>
        <div class="flex gap-2">
          <button 
            v-if="unpublishedChapters.length > 0"
            @click="selectAllChapters"
            class="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
          >
            {{ selectedChapters.length === unpublishedChapters.length ? 'Deselect All' : 'Select All' }}
          </button>
          <button
            v-if="unpublishedChapters.length > 0"
            @click="toggleEditOrder"
            class="px-4 py-2 text-sm border rounded-md hover:bg-gray-50"
          >
            {{ isEditingOrder ? 'Save Order' : 'Edit Order' }}
          </button>
          <button 
            v-if="selectedChapters.length > 0"
            @click="publishSelectedChapters"
            class="px-4 py-2 text-sm bg-blue-600 text-[--primary-text-color] rounded-md hover:bg-blue-700"
          >
            Publish Selected
          </button>
        </div>
      </div>
    </div>
    
    <div v-if="unpublishedChapters.length === 0" class="p-8 text-center">
      <p class="text-gray-500 mb-4">No unpublished chapters yet</p>
      <button 
        @click="goTo(`/edit/${novel.id}/new`)"
        class="px-6 py-3 bg-[--btn-color-1] text-[--btn-text-color] rounded-md"
      >
        New Chapter
      </button>
    </div>
    
    <Container
      v-else
      :get-child-payload="i => reorderedChapters[i]"
      @drop="updateChapterOrder"
      drag-handle-selector=".drag-handle"
      :lock-axis="isEditingOrder ? 'y' : null"
      :animation-duration="200"
      group-name="chapters"
    >
      <Draggable v-for="chapter in reorderedChapters" :key="chapter.id">
        <div 
          class="p-4 hover:bg-gray-50 flex items-center cursor-pointer border-b last:border-b-0"
          :class="{ 'bg-blue-50': isDragging }"
        >
          <div class="drag-handle cursor-move px-2" v-if="isEditingOrder">
            <svg class="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 8h16M4 16h16"></path>
            </svg>
          </div>
          <input
            type="checkbox"
            :checked="selectedChapters.includes(chapter.id)"
            @change="selectChapter(chapter.id)"
            class="mr-4"
          />
          <div class="flex-1">
            <span class="text-[--primary-text-color]">Chapter {{ chapter.chapterNumber }}: {{ chapter.title }}</span>
            <span class="text-gray-500 text-sm ml-2">{{ chapter.lastModified }}</span>
          </div>
          <div class="flex gap-2">
            <button 
              @click="goTo(`/edit/${novel.id}/${chapter.id}/unpub/false`)"
              class="px-2 py-1 text-sm border rounded-md bg-[--btn-color-4] text-[--btn-text-color]"
            >
              <Pencil />
            </button>
            <button
              @click="deleteChapterMode(chapter.id, 'unpub')"
              class="px-2 py-1 text-sm border bg-[--btn-color-4] text-[--btn-text-color] rounded-md hover:bg-red-700"
            >
              <FileX />
          </button>
          </div>
        </div>
      </Draggable>
    </Container>
  </div>

<!-- Drafts Tab -->
<div v-if="activeTab === 'drafts'" class="bg-[--card-bg-color] novel-summary-card  rounded-lg shadow">
  <div class="p-4 border-b">
    <div class="flex justify-between items-center">
      <h2 class="text-xl text-[--primary-text-color] font-[500]">Draft Chapters</h2>
    </div>
  </div>

  <div v-if="draftChapters.length === 0" class="p-8 text-center">
    <p class="text-gray-500 mb-4">No drafts yet</p>
    <button 
      @click="router.push(`/write/${novel.id}/new`)"
      class="px-6 py-3 bg-[--btn-color-1] text-[--btn-text-color] rounded-md"
    >
      Start New Draft
    </button>
  </div>

  <div v-else class="divide-y">
    <div 
      v-for="draft in draftChapters" 
      :key="draft.id"
      class="p-4 hover:bg-gray-50 flex justify-between items-center"
    >
      <div>
        <span class="font-medium text-[--primary-text-color]">{{ draft.title || 'Untitled Draft' }}</span>
        <span class="text-gray-500 text-sm ml-2">Last modified: {{ formatDate(draft.updatedAt) }}</span>
      </div>
      <div class="flex gap-2">
        <button 
          @click="goTo(`${novel.id}/${draft.id}/draft/false`)"
          class="px-2 py-1 text-sm border rounded-md bg-[--btn-color-4] text-[--btn-text-color] "
        >
          <Pencil></Pencil>
      </button>
        <button 
          @click="deleteChapterMode(draft.id, 'draft')"
          class="px-2 py-1 text-sm border bg-[--btn-color-4] text-[--btn-text-color] rounded-md hover:bg-red-700"
        >
          <FileX></FileX>
        </button>
      </div>
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
  import { BookOpen, UserRoundPen,Tickets, Eye, Users, Star, StarOff, Pencil, FileX, Trash, Tags, Tag  } from 'lucide-vue-next';

  import { getSessionToken, getApiKey } from '../utils/utils';
  import LoadingAnimation from '~/components/LoadingAnimation.vue';

  definePageMeta({
    components: [Container,Draggable, BookOpen, Eye, Users, Star, StarOff,Pencil, FileX, Trash, Tag, Tags]
  })
      const params = useRoute().params;
      const router = useRouter();
      const { $store, $fetchWithCache } = useNuxtApp();

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
      const headers = ref({})
      const isLatestDisabled = ref(false);
      const isFirstDisabled = ref(true);
      const activeTab = ref('about');
      const resetImage = ref(null)
      const tabs = [
        { id: 'about', name: 'About' },
        { id: 'chapters', name: 'Table of Contents' },
        { id: 'unpublished', name: 'Unpublished Chapters' },
        { id: 'drafts', name: 'Drafts' },
        { id: 'reviews', name: 'Reviews' },
      ];

      const pagination = ref({
        totalItems: 0,
        totalPages: 0,
        currentPage: 1,
        pageSize: 20,
      });
      const currentChapters = ref([])
      const similarNovels = ref([]);
      const genres = ref(["Fantasy", "Romance", "Thriller", "Sci-Fi", "Adventure"]);
  
      const statutypes = ref(["Ongoing", "Hiatus", "Completed"])
  
      const isModalOpen = ref(false);
      const modalType = ref("");
      const modalTitle = ref("");
      const modalInput = ref("");
      const tagSearch = ref("");
      const genreSearch = ref("")
      const selectedTags = ref([]);
      const initialTags = ref([]);
      const selectedGenres = ref([])
      const initialGenres = ref([])
  
      const novelData = reactive({});
      const updateData = reactive({
        title: "",
        author: "",
        genres: [],
        summary: "",
        tags: [],
        status: "",
      });
      headers.value = await $store.getNormalHeaders()
  
      const resetUpdateData = () => {
        updateData.title = ""
        updateData.author = ""
        updateData.genres = []
        updateData.summary = ""
        updateData.tags = []
        updateData.status = ""
      };

      const formatDate = (dateString) => {
        const date = new Date(dateString);
        const options = { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
        return new Intl.DateTimeFormat('en-US', options).format(date);
      };

    const isEditingOrder = ref(false);
    const reorderedChapters = ref([]);
    const showDeleteNovelModal = ref(false);

    const toggleEditOrder = async () => {
      if (isEditingOrder.value) {
        // Save the edited order when toggling off
        try {
          await saveChapterOrder();
          alert('Chapter order saved successfully!');
        } catch (error) {
          alert('Failed to save chapter order. Please try again.');
        }
      }
      isEditingOrder.value = !isEditingOrder.value;
    };

    const saveChapterOrder = async () => {
      // make a new array which will only contain object with id and chapterNumber from the array of objects reorderedChapters
      const updatedChapters = reorderedChapters.value
      const headrs = await $store.getNormalHeaders()
      const res = await $fetch(`${API}novels/${params.id}/chapters/order?unpub`,{
        method: "PUT",
        headers: headrs,
        body: JSON.stringify(updatedChapters)
      })
    };



    const updateChapterOrder = ({ removedIndex, addedIndex }) => {
      // if (removedIndex === null || addedIndex === null) return;

      const chapters = [...reorderedChapters.value];
      const [movedChapter] = chapters.splice(removedIndex, 1);
      chapters.splice(addedIndex, 0, movedChapter);

      // Update reordered chapters
      reorderedChapters.value = chapters.map((chapter, index) => ({
        ...chapter,
        chapterNumber: index + 1 // Assuming chapterNumber is the new order index
      }));
    };

    const deleteChapter = async (chapterId) => {
      if (!confirm('Are you sure you want to delete this chapter?')) return;

      try {
        await $fetch(`${API}chapters/${chapterId}`, { method: 'DELETE' });
        unpublishedChapters.value = unpublishedChapters.value.filter(ch => ch.id !== chapterId);
      } catch (error) {
        alert('Failed to delete chapter. Please try again.');
      }
    };


    const deleteChapterMode = async(chapter_id, mode) => {
      if (!confirm('Are you sure you want to delete this chapter?')) return;
      var resp;
      try {
        resp = await $fetch(`${API}novels/${novel.value.id}/chapters/edit/${chapter_id}?query=${mode}`, 
        { 
          method: 'DELETE',
          headers: headers.value
        });
        if(mode === "unpub"){
          reorderedChapters.value = reorderedChapters.value.filter(ch => ch.id !== chapter_id);
        }else if (mode==="draft"){
          draftChapters.value = draftChapters.value.filter(ch => ch.id !== chapter_id);
        }else if(mode ==="pub"){
          currentChapters.value = currentChapters.value.filter(ch => ch.id !== chapter_id);
          novel.value.chapters--;
        }
      } catch (error) {
        alert('Failed to delete chapter. Please try again.');
      }
    }

      const goTo = (path) =>{
        console.log(path)
        router.push(path)
      };
  
      const openModal = (type, title, field) => {
        isModalOpen.value = true;
        modalType.value = type;
        modalTitle.value = title;
        modalInput.value = field ? novelData.value[field] : "";
  
        if (type === 'tags') {
          //edge case if tags in the novel data is empty or missing
          try{
            selectedTags.value = novelData.value.tags.map(tag => tag.name); // Initialize with existing tags
            initialTags.value = novelData.value.tags.map(tag => tag.name);
          }catch(error){
            selectedTags.value = [];
          }
        }
        if (type === 'genres') {
          //edge case if tags in the novel data is empty or missing
          try{
            selectedGenres.value = novelData.value.genres.map(genre => genre.name); // Initialize with existing tags
            initialGenres.value = novelData.value.genres.map(genre => genre.name);
          }catch(error){
            selectedGenres.value = [];
          }
        }
      };
  
      const closeModal = () => {
        isModalOpen.value = false;
        modalType.value = "";
        modalTitle.value = "";
        modalInput.value = "";
        tagSearch.value = "";
        genreSearch.value = ""
        resetUpdateData();
      };
  
      function prepareRequestBody(originalData, formData) {
          const requestBody = {};
  
          // Helper to check if a field has changed
          const hasChanged = (field) =>
            originalData[field] !== undefined && originalData[field] !== formData[field];
  
          // Check and include only changed fields
          if (hasChanged("title")) requestBody.title = formData.title;
          if (hasChanged("summary")) requestBody.summary = formData.summary;
          if (hasChanged("genres")) requestBody.genres = formData.genres;
          if (hasChanged("author")) requestBody.author = formData.author;
          if (hasChanged("status")) requestBody.status = formData.status
  
          // Handle tags separately
          if (JSON.stringify(originalData.tags) !== JSON.stringify(formData.tags)) {
            requestBody.tags = formData.tags || [];
          }
  
          return requestBody;
        }
  
  
      // const submitModal = async() => {
      //   if (modalType.value === "tags") {
      //     if (JSON.stringify(initialTags.value) !== JSON.stringify(selectedTags.value)) {
      //         // If tags have changed, update the tags field
              
      //         updateData.tags = selectedTags.value.map((tag) => ({ name: tag }));
      //     } else {
      //         closeModal();
      //         return;
      //     }
      //   } else if(modalType.value === "genres"){
      //     if (JSON.stringify(initialGenres.value) !== JSON.stringify(selectedGenres.value)) {
      //         // If tags have changed, update the tags field
              
      //         updateData.genres = selectedGenres.value.map((genre) => ({ name: genre }));
      //     } else {
      //         closeModal();
      //         return;
      //     }
      //   }
      //   else {
      //     const fieldMap = {
      //       title: "title",     // Use the field name as the id
      //       author: "author",
      //       genres: "genres",
      //       summary: "summary",
      //       tags: "tags",        // This will map directly to the tags field
      //       status: "status"
      //     };
      //     const field = fieldMap[modalType.value];
      //     if (field) updateData[field] = modalInput.value;
      //   }
      //   // headers.value = await $store.getNormalHeaders()
      //   const response = await $fetch(`${API}update/novel/${params.id}/`, {
      //     method: 'PUT',
      //     headers: headers.value,
      //     body: JSON.stringify(updateData)
      //   })
  
      //   if (response.statusCode === 200) {
      //       novel.value = response.body;
      //       novelData.value = response.body;
      //   } else {
      //     alert(response.message);
      //   }
        
      //   closeModal();
      // };
  
  
      // const submitModal = () => {
      //   if (modalType.value === "text" || modalType.value === "select") {
      //     const field = modalType.value === "text" ? "title" : "genre";
      //     novel.value[field] = modalInput.value;
      //   } else if (modalType.value === "tags") {
      //     novel.value.tags = selectedTags.value.map((tag) => ({ name: tag }));
      //   }
      //   closeModal();
      // };

      const submitModal = async () => {
  const requestBody = {};

  // Helper function to check if a field has changed
  const hasChanged = (field) => {
    return novelData.value[field] !== updateData[field];
  };

  // Check and include only changed fields
  if (modalType.value === "tags") {
    if (JSON.stringify(initialTags.value) !== JSON.stringify(selectedTags.value)) {
      requestBody.tags = selectedTags.value.map((tag) => ({ name: tag }));
    }
  } else if (modalType.value === "genres") {
    if (JSON.stringify(initialGenres.value) !== JSON.stringify(selectedGenres.value)) {
      requestBody.genres = selectedGenres.value.map((genre) => ({ name: genre }));
    }
  } else {
    const fieldMap = {
      title: "title",
      author: "author",
      summary: "summary",
      status: "status",
    };

    const field = fieldMap[modalType.value];
    if(field) updateData[field] = modalInput.value;
    if (field && hasChanged(field)) {
      requestBody[field] = updateData[field];
    }
  }

  // Only proceed with the API request if there are changes
  if (Object.keys(requestBody).length > 0) {
    try {
      const response = await $fetch(`${API}update/novel/${params.id}/`, {
        method: 'PUT',
        headers: headers.value,
        body: JSON.stringify(requestBody),
      });

      if (response.statusCode === 200) {
        novel.value = response.body;
        novelData.value = response.body;
      } else {
        alert(response.message);
      }
    } catch (error) {
      alert('Failed to update novel. Please try again.');
    }
  }

  closeModal();
};
      const searchTags = () => {
        console.log(`Searching tags for: ${tagSearch.value}`);
      };
      const searchGenres = () =>{
        console.log(`Searching genres for: ${tagSearch.value}`);

      }
  
      const addTag = () => {
        console.log(tagSearch.value);
        if (tagSearch.value && !selectedTags.value.includes(tagSearch.value)) {
          selectedTags.value.push(tagSearch.value);
        }
        tagSearch.value = "";
        modalInput.value = "";
      };
      const addGenre = () => {
        console.log(genreSearch.value);
        if (genreSearch.value && !selectedGenres.value.includes(genreSearch.value)) {
          selectedGenres.value.push(genreSearch.value);
        }
        genreSearch.value = "";
        modalInput.value = "";
      };
  
      const removeTag = (tag) => {
          selectedTags.value = selectedTags.value.filter((t) => t !== tag); // Remove tag
      };
      const removeGenre = (genre) =>{
        selectedGenres.value = selectedGenres.value.filter((g) => g !== genre);
      }

      const deleteNovelModal = () => {
        showDeleteNovelModal.value = true;
      }
  
      const deleteNovel = async () => {
            // const headers = await $store.getNormalHeaders()
            const response = await $fetch(`${API}delete/novel/${params.id}`, {
              method: 'DELETE',
              headers: headers.value,
            });
            if (response.statusCode === 200) {
              router.push("/write");
            }else{
              alert(response.message);
            }
            showDeleteNovelModal.value = false;
      }
  
      const novel = ref(null);
  
      // const fetchNovel = async () => {
      //   const response = await $fetch(`${API}novel?id=${params.id}`);
      //   console.log(response.status);
      //   novel.value = response.body.novel;
      // };

      // TODO add useFetch or add all geners in the client side
      const getAllGenres = async () => {
        const response = await $fetchWithCache(`${API}all_genres`,{},200000);
        genres.value = response.body;
      };
      // const getAllGenres = async () => {
      //     const { data, pending, error } = await useFetch('${API}all_genres');

      //     if (error.value) {
      //       console.error('Error fetching genres:', error.value);
      //       return;
      //     }
      //     // Access the data under `data.value.body`
      //     genres.value = data.value?.body || [];
      //     // console.log(genres.value);
      // };


      const getAllDrafts = async () => {
        const resp = await $fetchWithCache(`${API}novels/${params.id}`,{
          params:{
            page: 1,
            limit: 100,
            type: "draft"
          }
        }, 60000)
        if(resp.statusCode === 200){
          draftChapters.value = resp.body.chapters.sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

          // $store.setChapters(params.id, resp.body.chapters, "draft")  //save in the drafts
        }
      }

      const getAllUnpubs = async () => {
        const resp = await $fetchWithCache(`${API}novels/${params.id}`,{
          params:{
            page:1,
            limit:100,
            type: "unpub"
          }
        },60000)
        if(resp.statusCode === 200){
          unpublishedChapters.value = resp.body.chapters.sort((a, b) => a.chapterNumber - b.chapterNumber);
          reorderedChapters.value = [...resp.body.chapters]; 
          // $store.setChapters(params.id, resp.body.chapters, "unpub")  //save in the drafts
        }
      }

      // Watch the activeTab and run getAllDrafts if activeTab is 'drafts'
      watch(activeTab, async(newTab) => {
        if (newTab === 'drafts') {
          getAllDrafts()
        }else if(newTab === 'unpublished'){
          getAllUnpubs()
        }else if(newTab === 'chapters'){
          fetchChapters()
        }
      })

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

      const goToPage = (page) =>{
        fetchChapters(page);
        pagination.value.currentPage = page
      }

      const showAllChapters = () => {
        fetchChapters(1,9999)
        pagination.value.currentPage = -1
      }
        
      onMounted(async() => {
        try{
          // default is 60000 ms cache
          const data = await $fetchWithCache(`${API}metadata/novel/${params.id}`);
    
          
          if(data.statusCode != 200){
            router.push(`/novel/${params.id}`)
          }else{
            novel.value = data.body.novel;
            novelData.value = data.body.novel;
            updateData.value = data.body.novel;
            await getAllGenres()
          }
  
        }catch(error){
          console.log(error)
          alert("Please Log in To use this function")
          // router.push(`/novel/${params.id}`)
        }
        // await getAllDrafts()
      });

      const isReverse = ref(false);
  
      const toggleChapterOrder = (change=true) => {
        if(change){
          isReverse.value = !isReverse.value
        }
        currentChapters.value.reverse();
      };
  
  
  
      function goToChapter(chapter_num) {
        router.push(`/novel/${params.id}/chapter/${chapter_num}`);
      }


      const unpublishedChapters = ref([]);
    const draftChapters = ref([]);
    const selectedChapters = ref([]);
    const isDragging = ref(false);

    // Drag and drop handlers for vue-smooth-dnd
    const onDrop = ({ removedIndex, addedIndex }) => {
      if (removedIndex === null || addedIndex === null) return;
      
      const chapters = [...unpublishedChapters.value];
      const [item] = chapters.splice(removedIndex, 1);
      chapters.splice(addedIndex, 0, item);
      unpublishedChapters.value = chapters;
    };

    const getDragHandleSelector = () => '.drag-handle';

    const selectChapter = (chapterId) => {
      const index = selectedChapters.value.indexOf(chapterId);
      if (index === -1) {
        selectedChapters.value.push(chapterId);
      } else {
        selectedChapters.value.splice(index, 1);
      }
    };

    const selectAllChapters = () => {
      if (selectedChapters.value.length === unpublishedChapters.value.length) {
        selectedChapters.value = [];
      } else {
        selectedChapters.value = unpublishedChapters.value.map(chapter => chapter.id);
      }
    };

    const publishSelectedChapters = async () => {
      try {
        const response = await $fetch(`${API}novels/${params.id}/chapters/publish`, {
          method: 'PUT',
          headers: headers.value,
          body: JSON.stringify({
            novelId: params.id,
            chapterIds: selectedChapters.value
          })
        });
        
        if (response.statusCode === 200) {
          unpublishedChapters.value = unpublishedChapters.value.filter(
            chapter => !selectedChapters.value.includes(chapter.id)
          );
          selectedChapters.value = [];
        }
      } catch (error) {
        alert('Failed to publish chapters. Please try again.');
      }
    };

    const deleteDraft = async (draftId) => {
      if (confirm('Are you sure you want to delete this draft?')) {
        try {

          const response = await $fetch(`${API}drafts/${draftId}`, {
            method: 'DELETE',
            headers: headers.value
          });
          
          if (response.statusCode === 200) {
            draftChapters.value = draftChapters.value.filter(
              draft => draft.id !== draftId
            );
          }
        } catch (error) {
          alert('Failed to delete draft. Please try again.');
        }
      }
    };
    
    onUnmounted(async () => {
      try{
        $store.deleteCache("${API}novels/"+params.id) 
      }catch(e){
        console.log(e)
      }
    })



    const resetCoverImg = async (imageUrl) => {
      try {
        const updateData = {
          coverImage: imageUrl
        }
        const response = await $fetch(`${API}update/novel/${params.id}/`, {
          method: 'PUT',
          headers: headers.value,
          body: JSON.stringify(updateData)
        })
  
        if (response.statusCode === 200) {
            resetImage.value = response.body.coverImage;
        } else {
          alert(response.message);
        }
      } catch (error) {
        console.error('Error handling final image:', error);
      }
    };

    const compressImage = async (blob, maxSizeKB) => {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.src = URL.createObjectURL(blob);

        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');

          // Set the maximum dimensions (optional: adjust as needed)
          const MAX_WIDTH = 516;
          const MAX_HEIGHT = 516;
          let width = img.width;
          let height = img.height;

          // Resize the image if it exceeds the maximum dimensions
          if (width > MAX_WIDTH || height > MAX_HEIGHT) {
            if (width > height) {
              height *= MAX_WIDTH / width;
              width = MAX_WIDTH;
            } else {
              width *= MAX_HEIGHT / height;
              height = MAX_HEIGHT;
            }
          }

          canvas.width = width;
          canvas.height = height;

          // Draw the image on the canvas
          ctx.drawImage(img, 0, 0, width, height);

          // Compress the image by adjusting the quality
          let quality = 0.9; // Start with 90% quality
          let compressedBlob;

          const compress = () => {
            canvas.toBlob(
              (blob) => {
                if (blob.size / 1024 <= maxSizeKB) {
                  resolve(blob); // Resolve if the size is within the limit
                } else if (quality > 0.1) {
                  quality -= 0.1; // Reduce quality and try again
                  canvas.toBlob(
                    (blob) => {
                      compressedBlob = blob;
                      compress();
                    },
                    'image/jpeg',
                    quality
                  );
                } else {
                  reject(new Error('Unable to compress image below the specified size'));
                }
              },
              'image/jpeg',
              quality
            );
          };

          compress();
        };

        img.onerror = (error) => {
          reject(error);
        };
      });
    };

    const uploadToCDN = async (blob) => {
      const formData = new FormData();
      formData.append('image', blob);
      try {
        const data = await $fetch(`${API}upload/image`, {
          method: 'POST',
          body: formData,
        });

        if (data.statusCode === 200) {
          return data.url; // Return the CDN link
        } else {
          throw new Error('Failed to upload image to CDN');
        }
      } catch (error) {
        console.error('Error uploading to CDN:', error);
        throw error;
      }
    };
      
  </script>
  
  <style scoped>
  button {
    font-size: 0.875rem; /* Default (small screens) */
    padding: 5px 10px;
  }
  
  @media (min-width: 768px) {
    button {
      font-size: 1rem; /* Medium screens */
      padding: 10px 20px;
    }
  }
  
  .smooth-dnd-container {
    min-height: 30px;
  }
  .smooth-dnd-draggable-wrapper {
    overflow: visible;
  }
  </style>
  