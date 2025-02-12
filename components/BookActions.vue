<template>
    <div class="flex flex-col gap-4 items-center justify-center h-full">
      <!-- Create New Book Button -->
      <button 
        class="btn-primary w-48 flex items-center gap-2 p-2 rounded"
        @click="showNewBookForm = true"
      >
        <span class="icon">+</span>
        {{ $t('Create New Book') }}
      </button>
  
      <!-- Upload Book Button -->
      <button 
        class="btn-primary w-48 flex items-center gap-2 p-2 rounded"
        @click="showUploadForm = true"
      >
        <span class="icon">↑</span>
        {{ $t('Upload a Book') }}
      </button>
  
      <!-- New Book Form Dialog -->
      <div v-if="showNewBookForm" class="dialog-overlay" @click="closeNewBookForm">
        <div class="dialog-content" @click.stop>
          <div class="dialog-header">
            <h3>{{ $t('Create New Book') }}</h3>
            <button class="close-btn" @click="closeNewBookForm">×</button>
          </div>
          <form @submit.prevent="handleNewBook" class="space-y-4">
            <div class="form-group">
              <label for="bookName">{{ $t('Book Name') }}</label>
              <input
                id="bookName"
                v-model="bookData.name"
                type="text"
                required
                class="form-input"
              />
            </div>
            <div class="form-group">
              <label for="genre">{{ $t('Genre') }}</label>
              <select 
                v-model="bookData.genre"
                required
                class="form-select"
              >
                <option value="">{{ $t('Select genre') }}</option>
                <option value="fiction">{{ $t('Fiction') }}</option>
                <option value="non-fiction">{{ $t('Non-Fiction') }}</option>
                <option value="fantasy">{{ $t('Fantasy') }}</option>
                <option value="mystery">{{ $t('Mystery') }}</option>
              </select>
            </div>
            <button type="submit" class="btn-submit w-full">
              {{ $t('Create Book') }}
            </button>
          </form>
        </div>
      </div>
  
      <!-- Upload Book Dialog -->
      <div v-if="showUploadForm" class="dialog-overlay" @click="closeUploadForm">
        <div class="dialog-content" @click.stop>
          <div class="dialog-header">
            <h3>{{ $t('Upload EPUB Book') }}</h3>
            <button class="close-btn" @click="closeUploadForm">×</button>
          </div>
          <div class="upload-area" :class="{ 'uploading': uploading }">
            <div v-if="!uploading && !uploadComplete" 
                 class="upload-prompt"
            >
              <span class="icon">↑</span>
              <span>{{ $t('Click to upload EPUB file') }}</span>
              <div class="file-input-label">
                <input
                  type="file"
                  accept=".epub"
                  class="hidden"
                  @change="handleFileUpload"
                  ref="fileInput"
                />
                <button 
                  type="button" 
                  class="btn-upload"
                  @click="$refs.fileInput.click()"
                >
                  {{ $t('Select File') }}
                </button>
              </div>
            </div>
            <div v-if="uploading" class="upload-status">
              <div class="spinner"></div>
              <span>{{ $t('Uploading...') }}</span>
            </div>
            <div v-if="uploadComplete" class="upload-status success">
              <span class="icon">✓</span>
              <span>{{ $t('Upload Complete!') }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { ref } from 'vue';
  import { useRouter } from 'vue-router';
  
  export default {
    name: 'BookActions',
    
    setup() {
      const router = useRouter();
      const fileInput = ref(null);
      const showNewBookForm = ref(false);
      const showUploadForm = ref(false);
      const uploading = ref(false);
      const uploadComplete = ref(false);
      const bookData = ref({
        name: '',
        genre: ''
      });
  
      const closeNewBookForm = () => {
        showNewBookForm.value = false;
        bookData.value = { name: '', genre: '' };
      };
  
      const closeUploadForm = () => {
        showUploadForm.value = false;
        uploading.value = false;
        uploadComplete.value = false;
      };
  
      const handleNewBook = async () => {
        try {
          // Add your book creation logic here
          closeNewBookForm();
          router.push('/edit-book');
        } catch (error) {
          console.error('Error creating book:', error);
        }
      };
  
      const handleFileUpload = async (event) => {
        const file = event.target.files[0];
        if (file && file.type === 'application/epub+zip') {
          uploading.value = true;
          
          try {
            // Simulate upload process
            await new Promise(resolve => setTimeout(resolve, 2000));
            
            // Example upload logic:
            // const formData = new FormData();
            // formData.append('book', file);
            // await fetch('${API}upload-book', {
            //   method: 'POST',
            //   body: formData
            // });
            
            uploading.value = false;
            uploadComplete.value = true;
            
            setTimeout(() => {
              closeUploadForm();
              router.push('/edit-book');
            }, 1500);
          } catch (error) {
            console.error('Error uploading file:', error);
            uploading.value = false;
          }
        }
      };
  
      return {
        fileInput,
        showNewBookForm,
        showUploadForm,
        uploading,
        uploadComplete,
        bookData,
        closeNewBookForm,
        closeUploadForm,
        handleNewBook,
        handleFileUpload
      };
    }
  };
  </script>
  
  <style scoped>
  .btn-primary {
    background-color: #4a5568;
    color: white;
    transition: background-color 0.2s;
  }
  
  .btn-primary:hover {
    background-color: #2d3748;
  }
  
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
    width: 100%;
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
  }
  
  .upload-prompt {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 1rem;
  }
  
  .file-input-label {
    cursor: pointer;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
  }
  
  .btn-upload {
    background-color: #4a5568;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.25rem;
    cursor: pointer;
    transition: background-color 0.2s;
  }
  
  .btn-upload:hover {
    background-color: #2d3748;
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
    opacity: 0;
  }
  </style>