<template>
  <div class="flex flex-col w-full px-4 h-screen bg-[--background-color] relative">
    <!-- Navigation Bar -->
    <div class="flex justify-between items-center py-4 sticky top-0 z-10">
      <!-- Library Selection - Responsive -->
      <div class="relative">
        <!-- Mobile Dropdown Trigger -->
        <div class="hidden max-md:block">
          <button
            @click="toggleLibraryDropdown"
            class="library-tab flex items-center justify-between gap-2 bg-[--section-bg-color] px-4 py-2 text-sm font-medium rounded-md"
          >
            <span class="truncate">{{ activeLibrary?.name || 'Select Library' }}</span>
            <ChevronDown 
              size="16"
              :class="[
                'transition-transform duration-200',
                libraryDropdownOpen ? 'transform rotate-180' : ''
              ]"
            />
          </button>
        </div>

        <!-- Desktop Tabs -->
        <div class="max-md:hidden flex gap-1 bg-[--section-bg-color] p-1 rounded-lg">
          <button
            v-for="library in libraries"
            :key="library.id"
            @click="activeLibrary = library"
            :class="[
              'library-tab px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
              activeLibrary && activeLibrary.id === library.id
                ? 'bg-[--add-group-btn-bg-color] text-[--add-group-btn-text-color] shadow-sm'
                : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
            ]"
          >
            {{ library.name }}
          </button>
        </div>

        <!-- Mobile Library Selection Dropdown -->
        <div 
          v-if="libraryDropdownOpen"
          class="absolute left-0 mt-2 w-[200px] bg-[--dropdown-bg-color] shadow-lg rounded-md z-20"
        >
          <ul class="py-1">
            <li 
              v-for="library in libraries" 
              :key="library.id"
              @click="selectLibrary(library)"
              class="px-4 py-2 hover:bg-gray-100 cursor-pointer text-sm"
              :class="{'bg-[--add-group-btn-bg-color] text-[--add-group-btn-text-color]': activeLibrary?.id === library.id}"
            >
              {{ library.name }}
            </li>
          </ul>
        </div>
      </div>
      
      <!-- Grouped Delete and Add Buttons -->
      <div class="flex gap-3 items-center">
        <!-- Delete Library Custom Dropdown Button -->
        <div class="p-1 relative">
          <button 
            @click="toggleDropdown"
            class="delete-dropdown-btn flex items-center gap-2 bg-[--add-group-btn-bg-color] hover:bg-[--add-group-btn-bg-color] text-[--add-group-btn-text-color] dark:hover:bg-gray-200 px-4 py-2 rounded-md text-sm font-medium  transition-all duration-200"
          >
            <TrashIcon size="16" />
            <ChevronDown size="16" />
          </button>
          <div 
            v-if="dropdownOpen" 
            class="absolute right-0 mt-2 bg-[--dropdown-bg-color] shadow-lg rounded-md z-20 w-[200px]"
          >
            <ul class="py-1">
              <li 
                v-for="library in libraries" 
                :key="library.id" 
                class="flex items-center justify-between gap-3 px-4 py-2 hover:bg-gray-100 cursor-pointer"
              >
                <span class="text-sm truncate">{{ library.name }}</span>
                <button 
                  @click.stop="confirmDelete(library)" 
                  class="text-red-500 hover:text-red-700"
                >
                  <TrashIcon size="14" />
                </button>
              </li>
            </ul>
          </div>
        </div>

        <!-- Add Library Button -->
        <button 
          @click="showModal = true"
          class="delete-dropdown-btn flex items-center gap-2 bg-[--add-group-btn-bg-color] hover:bg-[--add-group-btn-bg-color] text-[--add-group-btn-text-color] dark:hover:bg-gray-200 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
        >
          <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
            <path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
          <Library size="16" />
        </button>
      </div>
    </div>

    <!-- Content Area -->
    <div class="py-6 overflow-y-auto flex-1">
      <template v-if="activeLibrary">
        <LazyContentSection 
          :title="activeLibrary.name" 
          subtitle="Novels in this library"
          :items="combinedItems"
          @rename="handleRename"
        />
      </template>
      
      <div v-else class="flex items-center justify-center h-64">
        <p class="text-gray-500 dark:text-gray-400">No libraries found</p>
      </div>
    </div>

    <!-- Modal for Creating Library -->
    <LazyModal v-if="showModal" @close="showModal = false">
      <template #header>
        <h2 class="text-lg text-[--modal-text-color] font-semibold">Create New Library</h2>
      </template>
      <template #body>
        <p class="text-gray-700">Enter a name for your new library (max 20 characters):</p>
        <input 
          ref="inputRef"
          v-model="newLibraryName"
          placeholder="Library Name"
          maxlength="20"
          class="w-full p-2 text-[--modal-text-color] mt-2 border border-gray-300 rounded"
        />
      </template>
      <template #footer>
        <button 
          @click="createLibrary" 
          class="px-4 py-2 bg-[--create-btn-bg-color] text-[--create-btn-text-color] rounded-md"
        >
          Create
        </button>
      </template>
    </LazyModal>
    
    <!-- PrimeVue Confirmation Dialog -->
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { ref, computed, watchEffect, nextTick, onUnmounted } from 'vue';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';
import { ChevronDown, TrashIcon, Library } from 'lucide-vue-next';
import { PrimeIcons } from '@primevue/core/api';
import { useToast } from 'primevue/usetoast';

const confirm = useConfirm();
const toast = useToast();

const { $store } = useNuxtApp();
const userStore = useUserStore();
const webModeStore = useWebModeStore();
const inputRef = ref(null);

// Dropdown states
const dropdownOpen = ref(false);
const libraryDropdownOpen = ref(false);

const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
  if (dropdownOpen.value) {
    libraryDropdownOpen.value = false;
  }
};

const toggleLibraryDropdown = () => {
  libraryDropdownOpen.value = !libraryDropdownOpen.value;
  if (libraryDropdownOpen.value) {
    dropdownOpen.value = false;
  }
};

// Select library and close dropdown
const selectLibrary = (library) => {
  activeLibrary.value = library;
  libraryDropdownOpen.value = false;
};

// Hide dropdowns when clicking outside
const handleClickOutside = (e) => {
  if (!e.target.closest('.relative')) {

    dropdownOpen.value = false;
  }
  if (!e.target.closest('.library-tab')) {
    libraryDropdownOpen.value = false;
  }
};

// API configuration
let API;
const config = useRuntimeConfig().public;
if (webModeStore.webMode === "safe") {
  API = config.baseSafeAPI;
} else if (webModeStore.webMode === "pirate") {
  API = config.basePirateAPI;
} else {
  API = config.baseSafeAPI;
}

const headers = await $store.getNormalHeaders();
const userId = userStore.id;

// if(userStore.libraries.length <= 1){
// Fetch user libraries
const { data, error, pending } = await useSmartFetch(`${API}user/${userId}/library`, {
    method: "GET",
    headers: headers,
    enableCache: true,
    cacheTime: 10000,
  });

// State variables
const libraries = computed(() => data.value?.libraries || []);
const activeLibrary = ref(null);
const showModal = ref(false);
const newLibraryName = ref('');

// Set the first library as the default active tab (if available)
watchEffect(() => {
  if (libraries.value.length > 0 && !activeLibrary.value) {
    activeLibrary.value = libraries.value[0];
  }
});

watch(pending, (newVal) => {
  if (!newVal){
    let libs = []
    libraries.value.forEach(element => {
      
      element.libraryNovels.forEach((e) => {
        $store.setBookmarks(parseInt(e.novel.id), e.bookmarks)
        let readingHistory = e.readingHistory
        $store.setReadingHistory(parseInt(e.novel.id), readingHistory)
      })
      libs.push({
        id: element.id,
        name: element.name
      })
    });

    userStore.setLibraries(libs)
  }
})


const combinedItems = computed(() => {
  if (!activeLibrary.value) return [];

  return activeLibrary.value.libraryNovels.map(libraryNovel => {
    const novel = libraryNovel.novel;
    
    // Calculate max read chapter from readingHistory
    let maxReadChapter = 0;
    if (libraryNovel.readingHistory && libraryNovel.readingHistory.length) {
      // Assume each history item has a "chapter" property.
      maxReadChapter = Math.max(...libraryNovel.readingHistory.map(history => history.chapter || 0));
    }
    
    // Calculate percentage progress; if no chapters in novel, default to 0.
    const percentage = novel.chapters 
      ? Math.round((maxReadChapter / novel.chapters) * 100)
      : 0;
    
    // Get bookmark count
    const bookmarkCount = libraryNovel.bookmarks ? libraryNovel.bookmarks.length : 0;

    // Return a new object matching NovelAlbumCard's props structure.
    return {
      id: novel.id,
      title: novel.title,
      author: novel.author,
      coverImage: novel.coverImage,
      // Use percentage for progress
      percentage,
      // Also include bookmarkCount to show the bookmark info if needed
      bookmarkCount,
    };
  });
});
// Function to create a new library
const createLibrary = async () => {
  if (!newLibraryName.value.trim()) return;

  // Check if user already has 5 or more libraries
  if (libraries.value.length >= 5) {
    toast.add({
      severity: 'error',
      summary: 'Library Limit Reached',
      detail: 'You cannot create more than 5 libraries.',
      life: 3000
    });
    showModal.value = false;
    return;
  }

  try {
    const response = await $fetch(`${API}user/${userId}/create-library`, {
      method: "POST",
      headers: headers,
      body: JSON.stringify({ name: newLibraryName.value }),
    });

    if (response.statusCode === 200) {
      const newLibrary = {
        id: response.library.id,
        name: response.library.name,
        userId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        libraryNovels: []
      };

      data.value.libraries.push(newLibrary);
      activeLibrary.value = newLibrary;
      userStore.pushLibrary({ id: response.library.id, name: response.library.name });
      
      toast.add({
        severity: 'success',
        summary: 'Library Created',
        detail: 'Your library was created successfully.',
        life: 3000
      });
    } else {
      throw new Error(response.statusMessage || 'Failed to create library.');
    }
  } catch (err) {
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: err.message || 'An error occurred while creating the library.',
      life: 3000
    });
    console.error("Error creating library:", err);
  }

  newLibraryName.value = '';
  showModal.value = false;
};

// Function to confirm and delete a library
const confirmDelete = (library) => {
  confirm.require({
    message: `Are you sure you want to delete the library "${library.name}"?`,
    header: 'Confirm Deletion',
    icon: PrimeIcons.EXCLAMATION_TRIANGLE,
    acceptLabel: 'Delete',
    rejectLabel: 'Cancel',
    acceptClass: 'p-button-danger',
    rejectClass: 'p-button-secondary',
    accept: async () => {
      try {
        const response = await $fetch(`${API}user/${userId}/delete-library`, {
          method: 'DELETE',
          headers: headers,
          body: JSON.stringify({ name: library.name })
        });

        if (response.statusCode === 200) {
          data.value.libraries = libraries.value.filter(l => l.id !== library.id);
          if (activeLibrary.value && activeLibrary.value.id === library.id) {
            activeLibrary.value = libraries.value.length > 0 ? libraries.value[0] : null;
          }
          userStore.deleteLibrary(library.name);
          
          toast.add({
            severity: 'success',
            summary: 'Library Deleted',
            detail: 'The library was deleted successfully.',
            life: 3000
          });
        } else {
          throw new Error(response.statusMessage || 'Failed to delete library.');
        }
      } catch (err) {
        toast.add({
          severity: 'error',
          summary: 'Error',
          detail: err.message || 'An error occurred while deleting the library.',
          life: 3000
        });
        console.error("Error deleting library:", err);
      }
    }
  });
};

// Auto-focus the input when modal opens
watchEffect(() => {
  if (showModal.value) {
    newLibraryName.value = '';
    nextTick(() => inputRef.value?.focus());
  }
});

const handleRename = async(newName) =>{

  // console.log(activeLibrary.value.name, newName)
  const response = await $fetch(`${API}user/${userId}/library`, {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify({ old_name: activeLibrary.value.name, new_name: newName })
        });
  if(response.message==="Success"){
    activeLibrary.value.name = newName
    userStore.changeLibraryName(activeLibrary.value.name, newName)
  }
}

// Setup and cleanup event listeners
onMounted(() => {
  document.addEventListener('click', handleClickOutside);
});

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style>
/* Library tab and dropdown styles */
.library-tab {
  min-width: 50px;
  max-width: 80px;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.delete-dropdown-btn {
  min-width: 70px;
  max-width: 70px;
}

/* PrimeVue ConfirmDialog custom styles */
.p-dialog.p-component.p-confirmdialog {
  padding: 0.5rem 2rem 1rem 2rem;
  background-color: var(--modal-bg);
}

.p-dialog-header {
  margin-bottom: 3rem;
  color: var(--modal-text-color, #222);
}

.p-dialog-content {
  color: var(--text-secondary, #555);
}

.p-dialog-footer {
  margin-bottom: 1rem;
  margin-top: 2rem;
  display: flex;
  flex-direction: row;
  gap: 2rem;
  justify-content: flex-end;
}


.p-button.p-component.p-confirmdialog-accept-button.p-button-danger {
  padding: 0.25rem 0.5rem;
  background-color: var(--delete-btn-bg-color);
  color: var(--delete-btn-text-color);
  font-size: 1rem;
}
.p-button.p-component.p-confirmdialog-reject-button.p-button-secondary {
  padding: 0.25rem 0.5rem;
  background-color: var(--close-btn-bg-color);
  color: var(--close-btn-text-color);
  font-size: 1rem;
}
</style>
