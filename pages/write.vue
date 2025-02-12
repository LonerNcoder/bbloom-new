<template>
  <LoadingAnimation v-if="loading"></LoadingAnimation>
  <div>
  <div class="relative">
    <main class="main-content">
      <div class="novels-container">
        <div class="card">
          <section class="continue-writing card-body">
            <div class="card-header">
              <h2>{{ 'Continue Writing' }}</h2>
              <a class="viewmore-btn"><button @click="viewMore('continueSeries')">{{ 'View More' }}</button></a>
            </div>
            <NovelsGrid class="novel-list">
              <NovelCard v-for="novel in novels" :key="novel.id" :novel="novel" :to="`/edit/${novel.id}`" />
            </NovelsGrid>
          </section>
        </div>

        <div class="card">
          <section class="finished card-body">
            <div class="card-header">
              <h2>{{ 'Finished' }}</h2>
              <a class="viewmore-btn"><button @click="viewMore('finishedSeries')">{{ 'View More' }}</button></a>
            </div>
            <NovelsGrid class="novel-list">
              <NovelCard v-for="novel in novels" :key="novel.id" :novel="novel" :to="`/edit/${novel.id}`" />
            </NovelsGrid>
          </section>
        </div>

        <div class="card">
          <section class="published card-body">
            <div class="card-header">
              <h2>{{ 'Published' }}</h2>
              <a class="viewmore-btn"><button @click="viewMore('publishedSeries')">{{ 'View More' }}</button></a>
            </div>
            <NovelsGrid class="novel-list">
              <NovelCard v-for="novel in novels" :key="novel.id" :novel="novel" :to="`/edit/${novel.id}`" />
            </NovelsGrid>
          </section>
        </div>
      </div>

      <!-- Floating Action Button -->
       <div>
        <div class="fab-container" :class="{ 'fab-active': showFabMenu }">
        <button class="fab-main" @click="toggleFabMenu" :class="{ 'rotate': showFabMenu }">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-6 h-6">
            <path d="M17 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2Z" />
            <path d="M9 3v18" />
            <path d="m14 8 2 2-2 2" />
          </svg>
        </button>
        
        <div class="fab-menu" :class="{ 'show-menu': showFabMenu }">
          <button class="fab-item create-btn" @click="showNewBookForm = true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
              <path d="M12 5v14M5 12h14" />
            </svg>
            <span>Compose</span>
          </button>
          
          <button class="fab-item upload-btn" @click="showUploadForm = true">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="w-5 h-5">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="17 8 12 3 7 8" />
              <line x1="12" y1="3" x2="12" y2="15" />
            </svg>
            <span>Upload</span>
          </button>
        </div>
        </div>
      </div>

          <!-- New Book Form Dialog -->
    <div v-if="showNewBookForm" class="dialog-overlay" @click="closeNewBookForm">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>{{ 'Compose A New Book' }}</h3>
          <button class="close-btn" @click="closeNewBookForm">×</button>
        </div>
        <form @submit.prevent="handleNewBook" class="space-y-4">
          <div class="form-group">
            <label for="bookTitle">{{ 'Book Title' }}</label>
            <input
              id="bookTitle"
              v-model="bookData.title"
              type="text"
              required
              class="form-input"
            />
          </div>
          <!-- <div class="form-group">
            <label for="genre">{{ 'Genre' }}</label>
            <select 
              v-model="bookData.genre"
              required
              class="form-select"
            >
              <option value="">{{ 'Select genre' }}</option>
              <option value="fiction">{{ 'Fiction' }}</option>
              <option value="non-fiction">{{ 'Non-Fiction' }}</option>
              <option value="fantasy">{{ 'Fantasy' }}</option>
              <option value="mystery">{{ 'Mystery' }}</option>
            </select>
          </div> -->
          <button type="submit" class="btn-submit">
            {{ 'Create Book' }}
          </button>
        </form>
      </div>
    </div>

    <!-- Upload Book Dialog -->
    <div v-if="showUploadForm" class="dialog-overlay" @click="closeUploadForm">
      <div class="dialog-content" @click.stop>
        <div class="dialog-header">
          <h3>{{ 'Upload EPUB Book' }}</h3>
          <button class="close-btn" @click="closeUploadForm">×</button>
        </div>
        <div class="upload-area" :class="{ 'uploading': uploading }">
          <div v-if="!uploading && !uploadComplete" 
               class="upload-prompt"
               @click="triggerFileInput"
          >
            <span class="icon">↑</span>
            <span>{{ 'Click to upload EPUB file' }}</span>
            <input
              ref="fileInput"
              type="file"
              accept=".epub"
              class="hidden"
              @change="handleFileUpload"
            />
            <button 
                  type="button" 
                  class="btn-upload"
                  @click="$refs.fileInput.click()"
                >
                  {{ 'Select File' }}
                </button>
          </div>
          <div v-if="uploading" class="upload-status">
            <div class="spinner"></div>
            <span>{{ 'Uploading...' }}</span>
          </div>
          <div v-if="uploadComplete" class="upload-status success">
            <span class="icon">✓</span>
            <span>{{ 'Upload Complete!' }}</span>
          </div>
        </div>
      </div>
    </div>
    </main>
    </div>

  </div>
</template>

<script setup>
import NovelCard from '~/components/NovelCard.vue';
import { ref, computed, onMounted} from 'vue';
import { useRouter } from 'vue-router'
import { openDB } from 'idb';
import { Utensils } from 'lucide-vue-next';
// import { getSessionToken, getApiKey, getUserId } from '../utils/utils';
import { EPub } from 'epub2';
// import { promises as fs } from 'fs';
// definePageMeta({
//   middleware: 'auth',
// });
    const searchQuery = ref('');
    const { $store } = useNuxtApp();
    const novels = ref([]);
    const error = ref(null);
    const loading = ref(true);
    const showNewBookForm = ref(false);
    const showUploadForm = ref(false);
    const uploading = ref(false);
    const uploadComplete = ref(false);
    var API = useRuntimeConfig().public.baseSafeAPI
    // const bookData = ref({ name: '', genre: '' });
    const bookData = ref({ name: '' }); //only allow bookname at first as we can classify genre later
    const router = useRouter();

    const filteredcontinueSeries = computed(() => 
      novels.value.filter(n => n.category === 'continueSeries' && 
      n.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
    );
    
    const filteredfinished = computed(() => 
      novels.value.filter(n => n.category === 'finished' && 
      n.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
    );
    
    const filteredRandomNovels = computed(() => 
      novels.value.filter(n => n.category === 'randomNovels' && 
      n.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
    );
    
    const filteredRanking = computed(() => 
      novels.value.filter(n => n.category === 'novelsPublished' && 
      n.title.toLowerCase().includes(searchQuery.value.toLowerCase()))
    );

    const filterNovels = () => {
      // filtering is done in computed properties
    };

    const viewMore = (category) => {
      console.log("view more clicked for category", category);
    };

    const closeNewBookForm = () => {
      showNewBookForm.value = false;
      bookData.value = { title: '', genre: '' };
    };

    const closeUploadForm = () => {
      showUploadForm.value = false;
      uploading.value = false;
      uploadComplete.value = false;
    };

    const handleNewBook = async () => {
      try {

        const headers = await $store.getNormalHeaders()

        // Add your book creation logic here
        const response = await $fetch('${API}create/novel', {
          method: 'POST',
          headers: headers,
          body: JSON.stringify(bookData.value),
        });

        if (response.statusCode !== 200) {
          throw new Error(response.statusText);
        }else{
          novels.value.unshift(response.body);
          router.push('/edit/'+response.body.id);
          closeNewBookForm();
        }
      } catch (error) {
        alert('Error creating book: '+ error);
      }
    };

    const handleFileUpload = async (event) => {
      const file = event.target.files[0];
      if (file && file.type === 'application/epub+zip') {
        uploading.value = true;
        
        try {
            const formData = new FormData();
            formData.append('file', file);
            const headers = await $store.getFormHeaders()
            console.log(headers)

            const response = await $fetch(`${API}upload/epub`, {
              method: 'POST',
              headers: headers,
              body: formData,
            });

            if (!response.statusCode === 200) {
              throw new Error('Failed to upload file');
            }

            const data = await response.body;
            console.log('File uploaded:', data);

            uploading.value = false;
            uploadComplete.value = true;

            setTimeout(() => {
              closeUploadForm();
              router.push('/edit/' + data.id);
            }, 500);
        
          } catch (error) {
            alert('Error uploading file:', error);
            uploading.value = false;
        }
      }
    };

    onMounted(async () => {
      try {
        const userId = await $store.getUserId()
        const data = await $fetch(`${API}user/${userId}/novels`);
        novels.value = data.novels;
      } catch (err) {
        error.value = err.message || 'Failed to fetch novels';
        console.error(err);
      } finally {
        loading.value = false;
      }
    });
// ... Previous script code remains the same, just add:
const showFabMenu = ref(false);
const toggleFabMenu = () => {
  showFabMenu.value = !showFabMenu.value;
};

</script>

<style scoped>
.main-content {
  padding: 20px;
  position: relative;
  min-height: 100vh;
}

.novels-container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
}

.card {
  margin-bottom: 2rem;
  /* background: white; */
  border-radius: 0.5rem;
  /* box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1); */
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
/* Card body styling */
.card-body {
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 30px;
  background-color: var(--section-bg-color);

}
/* Floating Action Button styles */
.fab-container {
  position: fixed;
  bottom: 2rem;
  right: 2rem;
  z-index: 40;
}

.fab-main {
  width: 3.5rem;
  height: 3.5rem;
  background: #4a5568;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease;
}

.fab-main.rotate {
  transform: rotate(45deg);
}

.fab-main svg {
  width: 1.5rem;
  height: 1.5rem;
}

.fab-menu {
  position: absolute;
  bottom: 4.5rem;
  right: 0;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  opacity: 0;
  transform: translateY(10px);
  pointer-events: none;
  transition: all 0.3s ease;
}

.fab-menu.show-menu {
  opacity: 1;
  transform: translateY(0);
  pointer-events: auto;
}

.fab-item {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: white;
  border-radius: 1.5rem;
  border: 3px solid #4a5568;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  color: #4a5568;
  transition: all 0.2s ease;
}

.fab-item:hover {
  background: #4a5568;
  color: white;
  transform: translateX(-5px);
}

.fab-item svg {
  width: 1.25rem;
  height: 1.25rem;
}

.fab-item span {
  font-size: 0.9rem;
  font-weight: 700;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .main-content {
    padding: 1rem;
  }

  .card-header {
    flex-direction: column;
    gap: 1rem;
    align-items: flex-start;
  }

  .fab-container {
    bottom: 1.5rem;
    right: 1.5rem;
  }
}

/* Dialog Styles */
.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}
.dialog-content {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  width: 90%;
  max-width: 28rem;
}

.dialog-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
}

.close-btn {
  font-size: 1.5rem;
  color: #4a5568;
  cursor: pointer;
}

.form-group {
  margin-bottom: 1rem;
}

.form-input, .form-select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 0.25rem;
  margin-top: 0.25rem;
}

.btn-submit {
  background-color: #4a5568;
  color: white;
  padding: 0.5rem;
  border-radius: 0.25rem;
  width: 100%;
}

.upload-area {
  border: 2px dashed #e2e8f0;
  border-radius: 0.5rem;
  padding: 2rem;
  text-align: center;
  cursor: pointer;
}

.upload-prompt {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}

.upload-status {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
}

.spinner {
  border: 3px solid #f3f3f3;
  border-top: 3px solid #3498db;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  animation: spin 1s linear infinite;
}

.success {
  color: #48bb78;
}

.icon {
  font-size: 1.5rem;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.hidden {
  display: none;
}
</style>