<template>
    <div class="min-h-screen pb-8" @scroll="handleScroll" @touchstart="handleTouchStart" @touchend="handleTouchEnd">
      <LoadingAnimation v-if="loading" />
      <div v-else>
        <div :class="[
          'top-0 bg-[--background-color] shadow-sm z-10 exclude-toggle',
          { 'hidden-header': !isHeaderVisible },
        ]">
          <div class="max-w-6xl mx-auto px-4 py-4">
            <div class="flex justify-between items-center">
              <div class="flex gap-4">
                <button @click="backToNovel"
                  class="px-4 py-2 flex items-center gap-2 border rounded-md hover:bg-gray-50">
                  <Book class="w-4 h-4" />
                  <span class="font-medium text-sm">Back</span>
                </button>
                <button class="px-4 py-2 flex items-center gap-2 border rounded-md hover:bg-gray-50"
                  @click="navigateChapter(-1)" :disabled="!hasPreviousChapter"
                  :class="{ 'opacity-50 cursor-not-allowed': !hasPreviousChapter }">
                  <ChevronLeft class="w-4 h-4" />
                  Previous
                </button>
              </div>
              <div class="flex items-center gap-4">
                <button class="px-4 py-2 flex items-center gap-2 border rounded-md hover:bg-gray-50"
                  @click="navigateChapter(1)" :disabled="!hasNextChapter"
                  :class="{ 'opacity-50 cursor-not-allowed': !hasNextChapter }">
                  Next
                  <ChevronRight class="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
  
        <div class="max-w-4xl mx-auto mt-8 relative" ref="contentRef">
          <div v-if="chapter" ref="chapterBody" class="rounded-lg shadow p-4">
            <h1 class="text-2xl font-bold mb-6">
              Chapter {{ chapter.chapterNumber }}: {{ chapter.title }}
            </h1>
            <div v-dompurify-html="processedContent" ref="contentDiv"></div>
          </div>
  
          <div class="flex justify-between mt-8">
            <button class="px-4 py-2 flex items-center gap-2 border rounded-md hover:bg-gray-50"
              @click="navigateChapter(-1)" :disabled="!hasPreviousChapter"
              :class="{ 'opacity-50 cursor-not-allowed': !hasPreviousChapter }">
              <ChevronLeft class="w-4 h-4" />
              Previous Chapter
            </button>
            <button class="px-4 py-2 flex items-center gap-2 border rounded-md hover:bg-gray-50"
              @click="navigateChapter(1)" :disabled="!hasNextChapter"
              :class="{ 'opacity-50 cursor-not-allowed': !hasNextChapter }">
              Next Chapter
              <ChevronRight class="w-4 h-4" />
            </button>
          </div>
  
          <FloatingSettings :fontsize="parseInt(settings.fontSize)" :brightness="parseInt(settings.brightness)"
            :backgroundColor="settings.backgroundColor" :bookmark="Boolean(settings.isBookmarked)"
            :isMobile="Boolean(isMobile)" :isButtonVisible="Boolean(settings.isButtonVisible)"
            :gestureEnabled="Boolean(settings.gestureEnabled)" :fontColor="settings.fontColor"
            @fontsizeChanged="handleFontSizeChange" @brightnessChanged="handleBrightnessChange"
            @backgroundChanged="handleBackgroundChange" @fontColorChanged="handleFontColorChange"
            @bookmark="handleBookmark" @gesture="handleGesture">
          </FloatingSettings>
  
          <div v-if="isMobile && showButtons" class="mobile-buttons-container">
            <button class="mobile-button left" @click="navigateChapter(-1)" :disabled="!hasPreviousChapter"
              :class="{ 'opacity-50 cursor-not-allowed': !hasPreviousChapter }">
              <ChevronLeft class="w-6 h-6" />
            </button>
            <button class="mobile-button right" @click="navigateChapter(1)" :disabled="!hasNextChapter"
              :class="{ 'opacity-50 cursor-not-allowed': !hasNextChapter }">
              <ChevronRight class="w-6 h-6" />
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup lang="ts">
  import { ref, reactive, onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue';
  import { useRoute, useRouter } from 'vue-router';
  import { Book, ChevronLeft, ChevronRight } from 'lucide-vue-next';
  
  const { $store } = useNuxtApp();

  const webMode = ref(await $store.getWebMode())
  var API:String;
  const config = useRuntimeConfig().public
  if(webMode.value === "Safe"){
    API = String(config.baseSafeAPI)
  }else if(webMode.value === "Pirate"){
    API = String(config.basePriateAPI)
  }else{
    API = String(config.baseSafeAPI)
  }
  const route = useRoute();
  const router = useRouter();
  
  const isHeaderVisible = ref(true);
  const isMobile = ref(window.innerWidth < 768);
  const showButtons = ref(false);
  const loading = ref(true);
  
  const chapterBody = ref<HTMLElement | null>(null);
  const contentRef = ref<HTMLElement | null>(null);
  const contentDiv = ref<HTMLElement | null>(null);
  const initialTouchX = ref(0);
  const initialTouchY = ref(0);
  
  const settings = reactive(await $store.getReaderSettings());
  
  const chapter = ref({
    chapterNumber: 0,
    title: '',
    content: '',
    comments: [],
  });
  
  const processedContent = computed(() => {
    if (!chapter.value?.content) return '';
    return chapter.value.content;
  });
  
  const hasPreviousChapter = computed(() => chapter.value?.chapterNumber > 1);
  const totalChapters = ref(null);
  const hasNextChapter = computed(() => {
    return totalChapters.value !== null && chapter.value?.chapterNumber < totalChapters.value;
  });
  
  const handleScroll = () => {
    const scrollTop = document.documentElement.scrollTop || window.scrollY;
    isHeaderVisible.value = scrollTop < 100;
  };
  
  const handleTouchStart = (event: TouchEvent) => {
    initialTouchX.value = event.changedTouches[0].clientX;
    initialTouchY.value = event.changedTouches[0].clientY;
  };
  
  const handleTouchEnd = (event: TouchEvent) => {
    const finalX = event.changedTouches[0].clientX;
    const finalY = event.changedTouches[0].clientY;
    const diffX = finalX - initialTouchX.value;
    const diffY = finalY - initialTouchY.value;
  
    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 50 && settings.gestureEnabled) {
      if (diffX > 0 && hasPreviousChapter.value) {
        navigateChapter(-1);
      } else if (diffX < 0 && hasNextChapter.value) {
        navigateChapter(1);
      }
    }
  };
  
  const navigateChapter = (direction: number) => {
    const newChapterNum = parseInt(route.params.chapter_num as string) + direction;
    router.push(`/novel/${route.params.novel_id}/chapter/${newChapterNum}`);
  };
  
  const backToNovel = () => {
    router.push(`/novel/${route.params.novel_id}`);
  };
  
  const fetchChapter = async () => {
    try {
      const response = await $fetch(
        `${API}novels/${route.params.novel_id}/chapters/by_chapter_num/${route.params.chapter_num}`
      );
      chapter.value = response.body;
    } catch (error) {
      console.error('Error fetching chapter:', error);
      chapter.value = {
        chapterNumber: 0,
        title: 'Error Loading Chapter',
        content: '<p>Unable to load chapter content. Please try again later.</p>',
        comments: [],
      };
    }
  };
  
  const fetchTotalChapters = async () => {
    try {
      const cachedTotal = await $store.getNumberOfChapters(parseInt(route.params.novel_id as string));
      totalChapters.value = cachedTotal;
  
      if (!cachedTotal || Math.random() < 0.3) {
        const data = await $fetch(`${API}novels/${route.params.novel_id}/total`);
        if (!cachedTotal || data.chapters !== totalChapters.value) {
          totalChapters.value = data.chapters;
          await $store.setNumberOfChapters(parseInt(route.params.novel_id as string), data.chapters);
        }
      }
    } catch (error) {
      console.error('Error fetching total chapters:', error);
    }
  };
  
  const updateIsMobile = () => {
    isMobile.value = window.innerWidth < 768;
  };
  
  const applyStylesToElements = () => {
    if (!chapterBody.value) return;
  
    nextTick(() => {
      const elements = chapterBody.value!.querySelectorAll(
        'h1, h2, h3, h4, h5, h6, p, div, span, a, li, ul, ol, label, input, button, .text'
      );
      elements.forEach((el) => {
        (el as HTMLElement).style.fontSize = `${settings.fontSize}px`;
        (el as HTMLElement).style.color = settings.fontColor;
      });
    });
  };
  
  const applyTheme = () => {
    if (chapterBody.value) {
      chapterBody.value.style.backgroundColor = settings.backgroundColor;
      chapterBody.value.style.filter = `brightness(${settings.brightness}%)`;
    }
  };
  
  const handleFontSizeChange = (newFontVal: string) => {
    settings.fontSize = parseInt(newFontVal);
    applyStylesToElements();
  };
  
  const handleBackgroundChange = (newBgVal: string) => {
    settings.backgroundColor = newBgVal;
    applyTheme();
  };
  
  const handleBrightnessChange = (newBrightnessVal: string) => {
    settings.brightness = newBrightnessVal;
    applyTheme();
  };
  
  const handleFontColorChange = (newColor: string) => {
    settings.fontColor = newColor;
    applyStylesToElements();
  };
  
  const handleSummarize = () => {
    // Add your summarize logic here
    console.log('Summarize functionality not implemented yet.');
  };
  
  const handleGesture = (newVal: boolean) => {
    settings.gestureEnabled = newVal;
  };
  
  const handleBookmark = async (newVal: boolean) => {
    settings.isBookmarked = newVal;
    if (newVal) {
      await saveBookmark(parseInt(route.params.chapter_num as string));
    }
  };
  
  const saveBookmark = async (newChapter: number) => {
    try {
      await $store.setBookmark(parseInt(route.params.novel_id as string), newChapter);
    } catch (e) {
      console.error('Error saving bookmark:', e);
    }
  };
  
  watch(settings, async (newVal) => {
    await $store.setReaderSettings(newVal);
    applyTheme();
    applyStylesToElements();
  }, { deep: true });
  
  onMounted(async () => {
    await Promise.all([fetchChapter(), fetchTotalChapters()]);
    await saveBookmark(parseInt(route.params.chapter_num as string));
  
    window.addEventListener('scroll', handleScroll);
    window.addEventListener('resize', updateIsMobile);
    loading.value = false;
  
    nextTick(async () => {
      const savedSettings = await $store.getReaderSettings();
      Object.assign(settings, savedSettings);
      applyTheme();
      applyStylesToElements();
    });
  });
  
  onBeforeUnmount(() => {
    window.removeEventListener('scroll', handleScroll);
    window.removeEventListener('resize', updateIsMobile);
  });
  </script>
  
  <style scoped>
  .mobile-buttons-container {
    position: fixed;
    top: 50%;
    left: 0;
    right: 0;
    display: flex;
    justify-content: space-between;
    padding: 0 16px;
    pointer-events: none;
    z-index: 999;
  }
  
  .mobile-button {
    background-color: white;
    border: 1px solid #ddd;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
    border-radius: 50%;
    width: 50px;
    height: 50px;
    display: flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    transition: transform 0.3s ease-in-out;
  }
  
  .mobile-button.left {
    transform: translateX(-50%);
  }
  
  .mobile-button.right {
    transform: translateX(50%);
  }
  
  .hidden-header {
    opacity: 0;
    pointer-events: none;
    transition: opacity 0.3s ease-in-out;
  }
  </style>