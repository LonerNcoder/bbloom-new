<!-- pages/novel/[id].vue -->
<template>
    <div class="min-h-screen bg-gray-50 pb-8">
      <!-- Hero Section with Novel Info -->
      <div class="bg-white shadow-sm">
        <div class="max-w-7xl mx-auto px-4 py-6">
          <div class="flex gap-6">
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
              <h1 class="text-2xl font-bold mb-2">{{ novel.title }}</h1>
              <h2 class="text-lg text-gray-600 mb-4">{{ novel.originalTitle }}</h2>
              
              <div class="flex items-center gap-6 mb-4">
                <div class="flex items-center gap-2">
                  <Icon name="lucide:book-open" class="w-5 h-5 text-gray-600" />
                  <span>{{ novel.chapters }} Chapters</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon name="lucide:eye" class="w-5 h-5 text-gray-600" />
                  <span>{{ novel.views }} Views</span>
                </div>
                <div class="flex items-center gap-2">
                  <Icon name="lucide:users" class="w-5 h-5 text-gray-600" />
                  <span>{{ novel.readers }} Readers</span>
                </div>
              </div>
  
              <div class="flex items-center gap-2 mb-4">
                <div class="flex">
                  <Icon 
                    v-for="i in 5" 
                    :key="i"
                    :name="i <= novel.rating ? 'lucide:star' : 'lucide:star-off'" 
                    class="w-5 h-5" 
                    :class="i <= novel.rating ? 'text-yellow-400' : 'text-gray-300'"
                  />
                </div>
                <span class="text-lg font-semibold">{{ novel.rating }}</span>
                <span class="text-gray-500">({{ novel.reviewCount }} reviews)</span>
              </div>
  
              <div class="flex gap-3">
                <button class="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
                  Start Reading
                </button>
                <button class="px-6 py-2 border border-gray-300 rounded-md hover:bg-gray-50">
                  + Add to Library
                </button>
              </div>
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
              activeTab === tab.id ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
            ]"
          >
            {{ tab.name }}
          </button>
        </div>
  
        <!-- Tab Content -->
        <div class="mt-6">
          <!-- About Tab -->
          <div v-if="activeTab === 'about'" class="grid grid-cols-12 gap-6">
            <div class="col-span-8">
              <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-xl font-bold mb-4">Novel Summary</h2>
                <div class="space-y-4">
                  <div class="flex flex-wrap gap-2 mb-4">
                    <span 
                      v-for="tag in novel.tags" 
                      :key="tag"
                      class="px-3 py-1 bg-blue-50 text-blue-600 rounded-full text-sm"
                    >
                      {{ tag }}
                    </span>
                  </div>
                  <p class="text-gray-600 leading-relaxed" v-html="novel.summary"></p>
                </div>
              </div>
  
              <!-- Similar Novels -->
              <div class="mt-6 bg-white rounded-lg shadow p-6">
                <h2 class="text-xl font-bold mb-4">Similar Novels</h2>
                <div class="grid grid-cols-4 gap-4">
                  <div v-for="novel in similarNovels" :key="novel.id" class="space-y-2">
                    <img 
                      :src="novel.coverImage" 
                      :alt="novel.title"
                      class="w-full aspect-[3/4] object-cover rounded-md"
                    />
                    <h3 class="font-medium line-clamp-2">{{ novel.title }}</h3>
                    <div class="flex items-center text-sm text-gray-500">
                      <Icon 
                        :name="novel.status === 'Ongoing' ? 'lucide:loader' : 'lucide:check'" 
                        class="w-4 h-4 mr-1"
                      />
                      {{ novel.status }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
  
            <!-- Novel Details Sidebar -->
            <div class="col-span-4 space-y-6">
              <div class="bg-white rounded-lg shadow p-6">
                <h2 class="text-lg font-bold mb-4">Details</h2>
                <div class="space-y-4">
                  <div class="flex justify-between">
                    <span class="text-gray-600">Status</span>
                    <span>{{ novel.status }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Author</span>
                    <span>{{ novel.author }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Genre</span>
                    <span>{{ novel.genres.join(', ') }}</span>
                  </div>
                  <div class="flex justify-between">
                    <span class="text-gray-600">Rankings</span>
                    <div class="space-y-1 text-right">
                      <div>Weekly #{{ novel.weeklyRank }}</div>
                      <div>Monthly #{{ novel.monthlyRank }}</div>
                      <div>All Time #{{ novel.allTimeRank }}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Table of Contents Tab -->
          <div v-if="activeTab === 'chapters'" class="bg-white rounded-lg shadow">
            <div class="p-4 border-b">
              <div class="flex justify-between items-center">
                <h2 class="text-xl font-bold">Chapters</h2>
                <div class="flex gap-2">
                  <button class="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">
                    Latest
                  </button>
                  <button class="px-4 py-2 text-sm border rounded-md hover:bg-gray-50">
                    First
                  </button>
                </div>
              </div>
            </div>
            <div class="divide-y">
              <div 
                v-for="chapter in novel.chapters" 
                :key="chapter.id"
                class="p-4 hover:bg-gray-50 flex justify-between items-center cursor-pointer"
              >
                <span>Chapter {{ chapter.chapterNumber }}: {{ chapter.title }}</span>
                <span class="text-gray-500 text-sm">{{ chapter.date }}</span>
              </div>
            </div>
          </div>
  
          <!-- Reviews Tab -->
          <div v-if="activeTab === 'reviews'" class="bg-white rounded-lg shadow p-6">
            <div class="flex justify-between items-center mb-6">
              <h2 class="text-xl font-bold">Reviews</h2>
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
                    <Icon 
                      v-for="i in 5" 
                      :key="i"
                      :name="i <= review.rating ? 'lucide:star' : 'lucide:star-off'" 
                      class="w-4 h-4" 
                      :class="i <= review.rating ? 'text-yellow-400' : 'text-gray-300'"
                    />
                  </div>
                </div>
                <p class="text-gray-600">{{ review.content }}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref } from 'vue'
  
  const activeTab = ref('about')
  
  const tabs = [
    { id: 'about', name: 'About' },
    { id: 'chapters', name: 'Table of Contents' },
    { id: 'reviews', name: 'Reviews' }
  ]
  
  // Sample data - in real application, this would come from an API
  const novel = {
    id: 1,
    title: 'Longevity Through the Path of Survival: Starting with Playing the Suona, Funeral Cultivation Begins',
    originalTitle: '长生卫道：开局吹唢呐，送葬修仙',
    coverImage: '/novel-cover.jpg',
    chapters: 1202,
    views: 6989,
    readers: 63,
    rating: 3.3,
    reviewCount: 4,
    status: 'Ongoing',
    author: 'Xiong Ji Yi Chang Liang Nian Ban',
    genres: ['Comedy', 'Military', 'Xuanhuan'],
    weeklyRank: 303,
    monthlyRank: 1720,
    allTimeRank: 6627,
    tags: ['Cultivation', 'Immortals', 'Male Protagonist', 'System', 'Transmigration'],
    summary: `Bai Yu travels through the world of immortals.<br>
             Starting with immortality, he becomes stronger when he is buried.<br>
             Burying a master warrior, obtains the full-level Golden Bell Cover, and his blood is like a dragon!<br>
             Burying a Yuanying cultivator, obtains the top-level Heavenly Spiritual Root, and has extraordinary talent!<br>
             Burying the Immortal Emperors of the Heavens, obtains the Three Thousand Great Daos, and is arbitrary for eternity!<br>
             Bai Yu: I may not be able to surpass you, but I will definitely transcend you.`
  }
  
  // Add more data structures for chapters, reviews, and similar novels as needed
  </script>