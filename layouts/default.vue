<template>
    <v-app>
  <div class="app-wrapper">
      <header 
          class="w-full bg-[--header-bg-color] shadow-md transition-all duration-300 transform"
          :class="{'translate-y-0 opacity-100': isHeaderVisible, '-translate-y-full opacity-0': !isHeaderVisible}"
      >
          <!-- <div class="max-w-7xl mx-auto"> -->
          <div class="mx-auto">
              <div class="flex items-center h-16">
                  <!-- Logo -->
                  <div class="flex-shrink-0 pl-6">
                      <div class="logo-text" @click="navigateTo('/')">
                          BookBloom
                      </div>
                  </div>


                  <!-- Center Section -->
                  <div class="flex-grow flex justify-center items-center">
                      <!-- Desktop Navigation -->
                      <nav class="hidden md:flex space-x-4 lg:space-x-8">
                          <NuxtLink 
                              to="/" 
                              :class="[
                                  'nav-link',
                                  route.path === '/' ? 'active-link one' : ''
                              ]"
                          >
                              {{ 'home'}}
                          </NuxtLink>
                          <NuxtLink 
                              v-if="isLoggedIn" 
                              to="/write" 
                              :class="[
                                  'nav-link',
                                  route.path === '/write' ? 'active-link' : ''
                              ]"
                          >
                              {{ 'write'}}
                          </NuxtLink>
                          <NuxtLink 
                              v-if="isLoggedIn" 
                              to="/library" 
                              :class="[
                                  'nav-link',
                                  route.path === '/library' ? 'active-link' : ''
                              ]"
                          >
                              {{ 'library'}}
                          </NuxtLink>
                          <NuxtLink 
                              to="/search" 
                              :class="[
                                  'nav-link',
                                  route.path === '/search' ? 'active-link' : ''
                              ]"
                          >
                              {{ 'series' }}
                          </NuxtLink>
                          <NuxtLink 
                              to="/ranking" 
                              :class="[
                                  'nav-link',
                                  route.path === '/ranking' ? 'active-link' : ''
                              ]"
                          >
                              {{ 'ranking' }}
                          </NuxtLink>
                      </nav>

                      <!-- Search Bar
                      <div class="hidden md:block ml-4 lg:ml-8">
                          <input 
                              type="text" 
                              v-model="searchQuery"
                              @input="goSearchPage"
                              class="search-input"
                              placeholder="Search..."
                          />
                      </div> -->
                  </div>

                   <!-- Right Section -->
                   <div class="flex items-center space-x-2 lg:space-x-4 pr-6">
                      <!-- WebMode Selector -->
                      <select 
                          v-model="selectedWebMode" 
                          @change="changeWebMode"
                          class="webMode-select-new"
                      >
                          <option value="Safe">Safe</option>
                          <option value="Pirate">Pirate</option>
                          <option value="Nsfw">Nsfw</option>
                      </select>

                      <!-- Theme Toggle -->
                      <ColorScheme><USelect v-model="$colorMode.preference" :options="['system', 'light', 'dark']" /></ColorScheme>


                      <!-- Profile/Login Button -->
                      <div v-if="isLoggedIn">
                          <button 
                              @click="toggleProfileModal"
                              class="flex items-center px-4 py-2 rounded-full bg-[--btn-color-4] text-[--btn-text-color]
                              hover:bg-[--btn-color-3]
                              transition-colors duration-300 button-text"
                          >
                              {{ username }}
                          </button>
                      </div>
                      <div v-else>
                          <NuxtLink 
                              to="/login"
                              class="px-4 py-2 rounded-full bg-[--btn-color-4] text-white 
                              hover:bg-slate-700 dark:bg-slate-700 dark:hover:bg-[--btn-color-4] 
                              transition-colors duration-300 button-text"
                          >
                              Login
                          </NuxtLink>
                      </div>

                      <!-- Mobile Menu Button (smaller touch target on larger screens) -->
                      <button 
                          @click="toggleMenu"
                          class="md:hidden p-2 lg:p-1.5 rounded-lg hover:bg-slate-200 
                          dark:hover:bg-slate-700 transition-colors duration-300"
                      >
                          <div class="w-6 h-6 lg:w-5 lg:h-5 flex flex-col justify-between">
                              <span class="block w-full h-0.5 bg-[--btn-color-4] dark:bg-slate-300 transition-transform duration-300"
                                  :class="{ 'rotate-45 translate-y-2.5': isMenuOpen }"></span>
                              <span class="block w-full h-0.5 bg-[--btn-color-4] dark:bg-slate-300 transition-opacity duration-300"
                                  :class="{ 'opacity-0': isMenuOpen }"></span>
                              <span class="block w-full h-0.5 bg-[--btn-color-4] dark:bg-slate-300 transition-transform duration-300"
                                  :class="{ '-rotate-45 -translate-y-2.5': isMenuOpen }"></span>
                          </div>
                      </button>
                  </div>
              </div>
          </div>

          <!-- Mobile Navigation Menu -->
          <div 
              v-show="isMenuOpen"
              class="md:hidden bg-slate-100 dark:bg-slate-800 shadow-lg transition-all duration-300"
          >
              <div class="px-4 py-3 space-y-4">
                  <!-- Mobile Search -->
                  <!-- <input 
                      type="text" 
                      v-model="searchQuery"
                      @input="goSearchPage"
                      class="search-input"
                      placeholder="Search..."
                  /> -->

                  <!-- Mobile Navigation Links -->
                  <nav class="flex flex-col space-y-2">
                      <NuxtLink 
                          to="/" 
                          :class="[
                              'mobile-nav-link',
                              route.path === '/' ? 'active-link' : ''
                          ]"
                      >
                          {{ 'home' }}
                      </NuxtLink>
                      <NuxtLink 
                          v-if="isLoggedIn" 
                          to="/write" 
                          :class="[
                              'mobile-nav-link',
                              route.path === '/write' ? 'active-link' : ''
                          ]"
                      >
                          {{ 'write' }}
                      </NuxtLink>
                      <NuxtLink 
                          v-if="isLoggedIn" 
                          to="/library" 
                          :class="[
                              'mobile-nav-link',
                              route.path === '/library' ? 'active-link' : ''
                          ]"
                      >
                          {{ 'library' }}
                      </NuxtLink>
                      <NuxtLink 
                          to="/search" 
                          :class="[
                              'mobile-nav-link',
                              route.path === '/search' ? 'active-link' : ''
                          ]"
                      >
                          {{ 'series' }}
                      </NuxtLink>
                      <NuxtLink
                          to="/ranking" 
                          :class="[
                              'mobile-nav-link',
                              route.path === '/ranking' ? 'active-link' : ''
                          ]"
                      >
                          {{ 'ranking' }}
                      </NuxtLink>
                      <!-- ... other mobile links with similar active states ... -->
                  </nav>
              </div>
          </div>
      </header>
      
      <!-- Profile Modal -->
      <div v-if="isProfileModalOpen" class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div class="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-6 m-4 max-w-sm w-full transition-colors duration-300">
              <h3 class="text-xl font-semibold mb-4 dark:text-white">Profile Settings</h3>
              <p class="mb-4 dark:text-gray-300">Username: {{ username }}</p>
              <div class="flex flex-col space-y-3">
                  <button 
                      @click="logout"
                      class="w-full px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors duration-300"
                  >
                      Logout
                  </button>
                  <button 
                      @click="toggleProfileModal"
                      class="w-full px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors duration-300"
                  >
                      Close
                  </button>
              </div>
          </div>
      </div>

      <!-- Main Content Slot class="mt-16" margin-top 4rem -->
      <main>
          <slot/>
      </main>

      <!-- Footer -->
      <footer class="bg-white dark:bg-gray-900 shadow-lg mt-8 transition-colors duration-300">
          <div class="max-w-7xl mx-auto px-4 py-6 text-center text-gray-600 dark:text-gray-400">
              <p>&copy; 2025 BookBloom. All rights reserved.</p>
          </div>
      </footer>
  </div>
</v-app>
</template>

<script setup lang="js">
import { ref, onMounted, onUnmounted } from 'vue'

const router = useRouter();
const route = useRoute();
const { $store } = useNuxtApp();
const searchQuery = ref('');
const locale = ref("")
const selectedWebMode = ref('en');
const dbName = 'client-db';
const storeName = 'account-settings';
const username = ref("anon");
const isLoggedIn = ref(false);
const isMenuOpen = ref(false);
const isProfileModalOpen = ref(false);
const isDarkMode = ref(false);
const isHeaderVisible = ref(true);
const lastScrollY = ref(0);

const colorMode = useColorMode()

const toggleTheme = () => {
colorMode.preference = colorMode.value === 'dark' ? 'light' : 'dark'
}

const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

const toggleProfileModal = () => {
  isProfileModalOpen.value = !isProfileModalOpen.value;
};

const changeWebMode = async () => {
  locale.value = selectedWebMode.value;
  await $store.setWebMode(selectedWebMode.value)
  router.push(route.path)
  router.go()
  };
  // Scroll handler with debounce
  let scrollTimeout;
  const handleScroll = () => {
      if (scrollTimeout) {
          window.cancelAnimationFrame(scrollTimeout);
      }

      scrollTimeout = window.requestAnimationFrame(() => {
          const currentScrollY = window.scrollY;
              
          // Show header on scroll up or at top
          if (currentScrollY < lastScrollY.value || currentScrollY < 50) {
              isHeaderVisible.value = true;
          } 
          // Hide header on scroll down (after 50px from top)
          else if (currentScrollY > 50 && currentScrollY > lastScrollY.value) {
              isHeaderVisible.value = false;
          }
              
          lastScrollY.value = currentScrollY;
      });
};

onMounted(async () => {
  // Check system preference for dark mode
  const savedTheme = localStorage.getItem('theme');
  isDarkMode.value = savedTheme === 'dark' || 
      (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches);
          
  if (isDarkMode.value) {
      document.documentElement.classList.add('dark');
      }

      try {
              // const db = await openDB(dbName, 1, {
              //     upgrade(db) {
              //         const store = db.createObjectStore(storeName, { keyPath: 'id' });
              //         store.put({ id: 'webMode', value: 'en' });
              //         store.put({ id: 'user',
              //             value: {
              //                 id: "",
              //                 username: "anon",
              //                 image: "",
              //                 sessionToken: "",
              //                 accessToken: "",
              //                 apiKey: "",
              //                 logged_in: false 
              //             } });
              //     },
              // });
              // const tx = db.transaction(storeName, 'readonly');
              // const store = tx.objectStore(storeName);

              // const storedWebMode = await store.get('webMode');
              // const storedUser = await store.get('user');

              const storedUser = await $store.getUserData()
              const storedWebMode = await $store.getWebMode()
              console.log(storedWebMode)

              if (storedWebMode) {
                  selectedWebMode.value = storedWebMode;
                  locale.value = storedWebMode;
              }
              if (storedUser && storedUser.logged_in && storedUser.username) {
                  username.value = storedUser.username;
                  isLoggedIn.value = true;
              }

              // db.close();
          } catch (error) {
              console.error('Error retrieving data from IndexedDB:', error);
          }


          window.addEventListener('scroll', handleScroll, { passive: true });
      });

      onUnmounted(() => {
          window.removeEventListener('scroll', handleScroll);
          if (scrollTimeout) {
              window.cancelAnimationFrame(scrollTimeout);
          }
      });

      const filterNovels = () => {
          // Implementation for novel filtering
      };

      const logout = () => {
          username.value = "anon";
          isLoggedIn.value = false;
          isProfileModalOpen.value = false;
      };

      const goSearchPage = () =>{
          $store.setSearchQuery(searchQuery.value);
          route.push("/search")
      }
</script>


<style scoped>
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer components {
  .logo-text {
      @apply text-2xl md:text-xl sm:text-lg font-bold 
      text-[--logo-color]
      transition-colors duration-300;
  }

  .nav-link {
      @apply text-base md:text-sm 
      text-[--primary-text-color]
      hover:bg-[--btn-color-4]
      px-3 py-2 rounded-lg font-medium
      transition-colors duration-300;
  }

  .active-link {
      @apply bg-slate-200 text-slate-800 
      bg-[--btn-color-4]
      text-[--btn-text-color]
  }
  .one{
      background-color: #f49f0a !important;
  }
  .two{

  }
  .three{

  }

  .mobile-nav-link {
      @apply block px-3 py-2 rounded-lg
      text-sm
      text-slate-600 dark:text-slate-300 
      hover:text-slate-800 hover:bg-slate-200 
      dark:hover:text-white dark:hover:bg-slate-700 
      font-medium transition-colors duration-300;
  }

  .button-text {
      @apply text-base md:text-sm font-[500];
  }

  .search-input {
      @apply text-base md:text-sm 
      w-64 sm:w-full
      px-4 py-2 rounded-full 
      bg-white dark:bg-slate-700 
      text-slate-700 dark:text-white 
      focus:outline-none focus:ring-2 
      focus:ring-slate-500 dark:focus:ring-slate-400 
      transition-colors duration-300 
      placeholder-slate-400 dark:placeholder-slate-300;
      @screen md {
          width: 15vw; /* Set width to 15vw for medium screens */
      }
  }

  .webMode-select {
      @apply text-base md:text-sm
      px-3 py-2 rounded-lg 
      bg-[--btn-color-4] text-[--btn-text-color]
      border-0 focus:ring-2 
      focus:ring-slate-500 dark:focus:ring-slate-400 
      transition-colors duration-300;
  }
  .webMode-select-new{
      @apply text-base md:text-sm
      px-3 py-2 rounded-lg 
      bg-white text-[#00A6A6]
      border-0 focus:ring-2 
      focus:ring-slate-500 dark:focus:ring-slate-400 
      transition-colors duration-300;
  }
}

</style>
  
  