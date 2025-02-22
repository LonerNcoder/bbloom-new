<template>
  <div class="flex flex-col w-full h-screen bg-[--background-color] relative">

    <!-- Navigation Bar -->
    <div class="flex justify-between items-center p-4 sticky top-0 z-10">
      <div class="flex gap-1 bg-[--section-bg-color] p-1 rounded-lg">
        <button
          v-for="library in libraries"
          :key="library.id"
          @click="activeLibrary = library"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-md transition-all duration-200',
            activeLibrary && activeLibrary.id === library.id
              ? 'bg-[--add-group-btn-bg-color] text-[--add-group-btn-text-color] shadow-sm'
              : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'
          ]"
        >
          {{ library.name }}
        </button>
      </div>
      
      <!-- Delete Library Custom Dropdown Button -->
      <div class="relative">
        <button 
          @click="toggleDropdown"
          class="flex items-center gap-2 bg-[--add-group-btn-bg-color] hover:bg-[--add-group-btn-bg-color] text-[--add-group-btn-text-color] dark:hover:bg-gray-200 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
        >
          Delete Library
          <ChevronDown />
        </button>
        <div v-if="dropdownOpen" class="absolute right-0 mt-2 w-56 bg-white shadow-lg rounded-md z-20">
          <ul class="py-1">
            <li 
              v-for="library in libraries" 
              :key="library.id" 
              class="flex items-center justify-between px-4 py-2 hover:bg-gray-100 cursor-pointer"
            >
              <span>{{ library.name }}</span>
              <button 
                @click.stop="confirmDelete(library)" 
                class="text-red-500 hover:text-red-700"
              >
                <TrashIcon />
              </button>
            </li>
          </ul>
        </div>
      </div>

      <!-- Add Library Button -->
      <button 
        @click="showModal = true"
        class="flex items-center gap-2 bg-[--add-group-btn-bg-color] hover:bg-[--add-group-btn-bg-color] text-[--add-group-btn-text-color] dark:hover:bg-gray-200 px-4 py-2 rounded-md text-sm font-medium transition-all duration-200"
      >
        <svg class="w-4 h-4" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" />
          <path d="M12 8v8M8 12h8" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
        </svg>
        Add Library
      </button>
    </div>

    <!-- Content Area -->
    <div class="px-4 py-6 overflow-y-auto flex-1">
      <template v-if="activeLibrary">
        <ContentSection 
          :title="`Library: ${activeLibrary.name}`" 
          subtitle="Novels in this library"
          :items="activeLibrary.libraryNovels.map(ln => ln.novel)" 
        />
      </template>
      
      <div v-else class="flex items-center justify-center h-64">
        <p class="text-gray-500 dark:text-gray-400">No libraries found</p>
      </div>
    </div>

    <!-- Modal for Creating Library -->
    <Modal v-if="showModal" @close="showModal = false">
      <template #header>
        <h2 class="text-lg text-[--modal-text-color] font-semibold">Create New Library</h2>
      </template>
      <template #body>
        <p class="text-gray-700">Enter a name for your new library:</p>
        <input 
          ref="inputRef"
          v-model="newLibraryName"
          placeholder="Library Name"
          class="w-full p-2 text-[--modal-text-color] mt-2 border border-gray-300 rounded"
        />
      </template>
      <template #footer>
        <button 
          @click="createLibrary" 
          class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        >
          Create
        </button>
      </template>
    </Modal>
    
    <!-- PrimeVue Confirmation Dialog -->
    <ConfirmDialog />
  </div>
</template>

<script setup>
import { ref, computed, watchEffect, nextTick, onUnmounted } from 'vue';
import ConfirmDialog from 'primevue/confirmdialog';
import { useConfirm } from 'primevue/useconfirm';
import { ChevronDown, TrashIcon } from 'lucide-vue-next';
import { PrimeIcons } from '@primevue/core/api';


const confirm = useConfirm();

const { $store } = useNuxtApp();
const userStore = useUserStore();
const webModeStore = useWebModeStore();
const inputRef = ref(null);

// Dropdown state
const dropdownOpen = ref(false);
const toggleDropdown = () => {
  dropdownOpen.value = !dropdownOpen.value;
};

// Hide dropdown when clicking outside
const handleClickOutside = (e) => {
  if (!e.target.closest('.relative')) {
    dropdownOpen.value = false;
  }
};
document.addEventListener('click', handleClickOutside);

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

// Fetch user libraries
const { data, error } = useSmartFetch(`${API}user/${userId}/library`, {
  method: "GET",
  headers: headers
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

// Function to create a new library
const createLibrary = async () => {
  if (!newLibraryName.value.trim()) return;

  const newLibrary = {
    id: Date.now(), // Temporary ID before getting a real one from API
    name: newLibraryName.value,
    userId,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    libraryNovels: []
  };

  libraries.value.push(newLibrary);
  activeLibrary.value = newLibrary;
  showModal.value = false;

  try {
    const response = await $fetch(`${API}user/${userId}/create-library`, {
      method: "PUT",
      headers: headers,
      body: JSON.stringify({ name: newLibraryName.value }),
    });
    if (response.statusCode === 200) {
      newLibrary.id = response.library.id;
    } else {
      console.error("Failed to create library:", response.statusMessage);
    }
  } catch (err) {
    console.error("Error creating library:", err);
  }

  newLibraryName.value = '';
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
        } else {
          console.error("Failed to delete library:", response.statusMessage);
        }
      } catch (err) {
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

// Cleanup click listener on unmount
onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside);
});
</script>

<style>
.p-dialog.p-component.p-confirmdialog{
  padding: 0.5rem 2rem 1rem 2rem;
}
.p-dialog-header{
  margin-bottom: 3rem;
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
.p-button.p-component.p-confirmdialog-reject-button.p-button-secondary{
  padding: 0.25rem 0.5rem;
  background-color: var(--cancel-btn-bg-color);
  color: var(--cancel-btn-text-color);
  font-size: 1rem;
}
</style>
