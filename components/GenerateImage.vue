<template>
  <div class="ai-image-generator">
    <!-- Trigger Button -->
    <button class="trigger-button" @click="openModal">
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
        <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
        <circle cx="12" cy="13" r="3"></circle>
      </svg>
      Generate Image
    </button>

    <!-- Generator Modal -->
    <div 
      v-if="showModal" 
      class="generator-modal" 
      :class="{ 'fullscreen': isFullscreen }"
      :style="isFullscreen ? { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 9999 } : {}"
    >



      <div class="modal-content" :class="{ 'fullscreen-content': isFullscreen }">

        <div class="modal-headers">
          <h3 class="">
              {{ hasGeneratedImages ? 'Modify Image' : 'Generate Image' }}
          </h3>
          <!-- Modal Controls -->
          <div class="modal-controls">
              <button class="fullscreen-toggle" @click="toggleFullscreen">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <path v-if="!isFullscreen" d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
                  <path v-else d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
                </svg>
              </button>
              <button class="modal-close" @click="closeModal">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
          </div>
        </div>

        <!-- Main Content Area -->
        <div class="content-area">
          <!-- Left Side: Image Preview -->
          <div v-if="hasGeneratedImages" class="preview-area">
            <div class="image-preview">
              <img :src="currentImage" alt="Generated image" class="preview-image">
              
              <!-- Navigation Controls -->
              <div class="navigation-controls">
                <button 
                  class="nav-button" 
                  @click="prevImage" 
                  :disabled="!canNavigatePrev"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M19 12H5M12 19l-7-7 7-7"></path>
                  </svg>
                </button>
                <span class="image-counter">{{ currentImageIndex + 1 }} / {{ generatedImages.length }}</span>
                <button 
                  class="nav-button" 
                  @click="nextImage" 
                  :disabled="!canNavigateNext"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M5 12h14M12 5l7 7-7 7"></path>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Image History -->
            <div class="image-history">
              <div 
                v-for="(image, index) in generatedImages" 
                :key="index"
                class="history-thumbnail"
                :class="{ active: currentImageIndex === index }"
                @click="selectImage(index)"
              >
                <img :src="image" alt="Generated image thumbnail">
              </div>
            </div>
          </div>

          <!-- Right Side: Controls -->
          <div class="controls-area">
            <!-- <h3 class="text-xl font-semibold mb-4">
              {{ hasGeneratedImages ? 'Modify Image' : 'Generate Image' }}
            </h3> -->

            <!-- Upload Section -->
            <div v-if="!hasGeneratedImages" class="upload-section">
              <label class="upload-label">
                <input type="file" @change="handleFileUpload" accept="image/*" hidden>
                <span class="flex items-center">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
                    <path d="M21.2 15.2l-1.5 1.5a2.5 2.5 0 0 1-3.5 0l-4.2-4.2"></path>
                    <path d="M8.8 4.2l1.5 1.5"></path>
                    <path d="M13.5 3a2.5 2.5 0 0 1 3.5 3.5L7.2 16.8a2.5 2.5 0 0 1-3.5-3.5L13.5 3z"></path>
                  </svg>
                  Upload Image
                </span>
              </label>
              <span class="upload-hint">or generate from text</span>
            </div>

            <!-- Prompt Inputs -->
            <div class="prompt-inputs">
              <textarea
                v-model="prompt"
                placeholder="Describe your image..."
                rows="3"
                class="prompt-textarea"
              ></textarea>
            </div>

            <!-- Advanced Settings Toggle -->
            <div class="advanced-settings-toggle">
              <button @click="toggleAdvancedSettings" class="toggle-button">
                <span>Advanced Settings</span>
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="20" 
                  height="20" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  stroke-width="2" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"
                  :class="{ 'rotate-180': showAdvanceSettings }"
                  class="transform transition-transform duration-200"
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </button>
            </div>

            <!-- Advanced Settings -->
            <div 
              v-show="showAdvanceSettings"
              class="advanced-settings"
              :class="{ 'settings-expanded': showAdvanceSettings }"
            >
              <!-- Model Selection -->

              <div class="settings-group">
                    <label>Negative Prompt</label>         
                    <textarea
                      v-model="negativePrompt"
                      placeholder="Negative prompt (what to exclude)..."
                      rows="2"
                      class="prompt-textarea"
                    ></textarea>
                </div>
               <div class="model-height-width">
                  <div class="model-height-width-group">
                    <label>Model</label>
                    <select v-model="selectedModel" class="model-select">
                      <option value="flux">Flux</option>
                      <option value="realistic">Realistic</option>
                      <option value="sdxl">SDXL</option>
                    </select>
                  </div>

                  <div v-if="hasGeneratedImages" class="setting-group">
                    <label>Strength (0-1)</label>
                    <input 
                      type="number" 
                      v-model.number="strength" 
                      min="0" 
                      max="1"
                      step="0.1"
                    >
                  </div>

                  <div class="setting-group">
                    <label>Steps (1-20)</label>
                    <input 
                      type="number" 
                      v-model.number="numSteps" 
                      min="1" 
                      max="20"
                      step="1"
                    >
                  </div>
                  
                </div>
              
              <div class="settings-grid">
                <div class="setting-group">
                  <label>Width</label>
                  <input 
                    type="number" 
                    v-model.number="width" 
                    min="0" 
                    max="1024"
                    @input="validateDimensions"
                  >
                </div>
                
                <div class="setting-group">
                  <label>Height</label>
                  <input 
                    type="number" 
                    v-model.number="height" 
                    min="0" 
                    max="1024"
                    @input="validateDimensions"
                  >
                </div>
                
                <div class="setting-group">
                  <label>Seed</label>
                  <input 
                    type="number" 
                    v-model.number="seed"
                    min="0"
                  >
                </div>
                
                <div class="setting-group">
                  <label>Guidance Scale (1-20)</label>
                  <input 
                    type="number" 
                    v-model.number="guidance" 
                    min="1" 
                    max="20" 
                    step="0.1"
                  >
                </div>

         

              </div>
            </div>

            <!-- Action Buttons -->
            <div class="action-buttons">
              <button
                class="primary-button"
                @click="handleGenerateClick"
                :disabled="!canGenerate"
              >
                <div v-if="isProcessing" class="spinner"></div>
                <span>{{ actionButtonText }}</span>
              </button>

              <button
                v-if="hasGeneratedImages"
                class="secondary-button"
                @click="resetToScratch"
                :disabled="isProcessing"
              >
                Start Over
              </button>

              <button
                v-if="hasGeneratedImages"
                class="success-button"
                @click="finalizeImage"
                :disabled="isProcessing"
              >
                Use Image
              </button>
            </div>

            <!-- Error Display -->
            <div v-if="dimensionError" class="dimension-error" role="alert">
              {{ dimensionError }}
            </div>
            <div v-if="error" class="error-message" role="alert">
              {{ error }}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';

const emit = defineEmits(['final-image', 'error']);

// State Management
const showModal = ref(false);
const isFullscreen = ref(false);
const showAdvanceSettings = ref(false);
const prompt = ref('');
const negativePrompt = ref('');
const width = ref(512);
const height = ref(512);
const seed = ref(0);
const guidance = ref(7.5);
const numSteps = ref(20);
const strength = ref(1);
const error = ref('');
const isProcessing = ref(false);
const dimensionError = ref('');
const selectedModel = ref('flux');

// Image Management
const generatedImages = ref([]);
const imageBase64List = ref([]);
const currentImageIndex = ref(-1);

// Toggle Functions
const toggleAdvancedSettings = () => {
  showAdvanceSettings.value = !showAdvanceSettings.value;
};


// Computed Properties
const hasGeneratedImages = computed(() => generatedImages.value.length > 0);
const currentImage = computed(() => hasGeneratedImages.value ? generatedImages.value[currentImageIndex.value] : null);
const canNavigatePrev = computed(() => currentImageIndex.value > 0);
const canNavigateNext = computed(() => currentImageIndex.value < generatedImages.value.length - 1);
const canGenerate = computed(() => {
  return prompt.value.trim() && 
         !isProcessing.value && 
         !dimensionError.value && 
         width.value >= 256 && 
         height.value >= 256;
});
const actionButtonText = computed(() => {
  if (isProcessing.value) return 'Processing...';
  return hasGeneratedImages.value ? 'Modify Image' : 'Generate Image';
});

// Utility Functions
const resetState = () => {
  prompt.value = '';
  negativePrompt.value = '';
  width.value = 256;
  height.value = 512;
  seed.value = 0;
  guidance.value = 15.5;
  numSteps.value = 20;
  strength.value = 1;
  error.value = '';
  dimensionError.value = '';
  isProcessing.value = false;
  isFullscreen.value = false;
  generatedImages.value = [];
  imageBase64List.value = [];
  currentImageIndex.value = -1;
};

const validateDimensions = () => {
  dimensionError.value = '';
  
  // Validate width
  if (width.value < 256) {
    dimensionError.value = 'Width must be at least 256 pixels';
  } else if (width.value > 1024) {
    width.value = 1024;
  }

  // Validate height
  if (height.value < 256) {
    dimensionError.value = dimensionError.value ? 
      `${dimensionError.value} and height must be at least 256 pixels` : 
      'Height must be at least 256 pixels';
  } else if (height.value > 1024) {
    height.value = 1024;
  }

  // Ensure values are divisible by 8
  if (width.value >= 256) {
    width.value = Math.floor(width.value / 8) * 8;
  }
  if (height.value >= 256) {
    height.value = Math.floor(height.value / 8) * 8;
  }
};

const ensureDivisibleBy8 = (value) => {
  return Math.max(256, Math.min(2048, Math.round(value / 8) * 8));
};

const imageToBase64 = async (blobOrFile) => {
  if (blobOrFile instanceof Blob) {
    const buffer = await blobOrFile.arrayBuffer();
    const bytes = new Uint8Array(buffer);
    const binary = bytes.reduce((acc, byte) => acc + String.fromCharCode(byte), '');
    return btoa(binary);
  } else {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result.split(',')[1]);
      reader.onerror = reject;
      reader.readAsDataURL(blobOrFile);
    });
  }
};

// Event Handlers
const handleGenerateClick = () => {
  if (hasGeneratedImages.value) {
    modifyImage();
  } else {
    generateImage();
  }
};

const handleFileUpload = async (event) => {
  const file = event.target.files[0];
  if (!file) return;

  try {
    const base64 = await imageToBase64(file);
    const imageUrl = URL.createObjectURL(file);
    
    generatedImages.value = [imageUrl];
    imageBase64List.value = [base64];
    currentImageIndex.value = 0;
  } catch (err) {
    error.value = 'Error uploading image';
    emit('error', err);
  }
};

const generateImage = async () => {
  if (!canGenerate.value) return;
  
  try {
    isProcessing.value = true;
    error.value = '';
    
    const response = await fetch('https://bookbloom-novel-image.iamparker0000.workers.dev/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt.value,
        negative_prompt: negativePrompt.value,
        width: width.value,
        height: height.value,
        seed: seed.value,
        guidance: guidance.value,
        num_steps: numSteps.value,
        model_type: selectedModel.value // Add model type
      })
    });

    if (!response.ok) {
      throw new Error(`Image generation failed: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    const base64 = await imageToBase64(blob);

    generatedImages.value.push(imageUrl);
    imageBase64List.value.push(base64);
    currentImageIndex.value = generatedImages.value.length - 1;
  } catch (err) {
    error.value = err.message;
    emit('error', err);
  } finally {
    isProcessing.value = false;
  }
};

const modifyImage = async () => {
  if (!canGenerate.value) return;
  
  try { 
    isProcessing.value = true;
    error.value = '';

    const response = await fetch('https://bookbloom-novel-image.iamparker0000.workers.dev/', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        prompt: prompt.value,
        negative_prompt: negativePrompt.value,
        image_b64: imageBase64List.value[currentImageIndex.value],
        width: width.value,
        height: height.value,
        seed: seed.value,
        guidance: guidance.value,
        num_steps: numSteps.value,
        strength: strength.value
      })
    });

    if (!response.ok) {
      throw new Error(`Image modification failed: ${response.statusText}`);
    }
    
    const blob = await response.blob();
    const imageUrl = URL.createObjectURL(blob);
    const base64 = await imageToBase64(blob);

    generatedImages.value.push(imageUrl);
    imageBase64List.value.push(base64);
    currentImageIndex.value = generatedImages.value.length - 1;
  } catch (err) {
    error.value = err.message;
    emit('error', err);
  } finally {
    isProcessing.value = false;
  }
};


// Navigation Functions
const prevImage = () => {
  if (canNavigatePrev.value) {
    currentImageIndex.value--;
  }
};

const nextImage = () => {
  if (canNavigateNext.value) {
    currentImageIndex.value++;
  }
};

const selectImage = (index) => {
  currentImageIndex.value = index;
};

// Modal Controls
const openModal = () => {
  showModal.value = true;
};

const closeModal = () => {
  if (isProcessing.value) {
    const confirmed = confirm('Are you sure you want to close? Current operation will be cancelled.');
    if (!confirmed) return;
  }
  showModal.value = false;
  resetState();
};

const toggleFullscreen = () => {
  isFullscreen.value = !isFullscreen.value;
};

const resetToScratch = () => {
  if (isProcessing.value) return;
  resetState();
};

const finalizeImage = () => {
  if (currentImage.value) {
    emit('final-image', currentImage.value);
    closeModal();
  }
};
</script>

<style scoped>

.modal-headers {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
}
.modal-headers h3{
  font-size: large;
  font-weight: 600;
}
.model-height-width {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}
.model-height-width-group{
  @apply flex flex-col gap-1;
}
.ai-image-generator {
  @apply relative inline-block;
}
.trigger-button {
  @apply bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center transition-colors duration-200;
}

.generator-modal {
  @apply fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center;
}

.generator-modal.fullscreen {
 /* @apply w-screen h-screen !important; */
}

.modal-content {
  @apply bg-white rounded-xl p-6 w-11/12 max-w-7xl h-[90vh] overflow-auto relative flex flex-col;
}

.modal-content.fullscreen-content {
  @apply w-screen h-screen max-w-none max-h-none rounded-none !important;
}
/* .modal-controls {
  @apply absolute top-3 right-3 flex items-center gap-2 z-10;
} */

.fullscreen-toggle,
.modal-close {
  @apply p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors duration-200;
}

.content-area {
  /* @apply flex flex-col md:flex-row gap-6 h-full overflow-y-auto; */
}


.preview-area {
  @apply md:w-2/3 flex flex-col gap-4;
}

.image-preview {
  @apply relative bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center;
  min-height: 400px;
}

.preview-image {
  @apply max-w-full max-h-[60vh] object-contain;
}

.navigation-controls {
  @apply absolute bottom-4 left-1/2 transform -translate-x-1/2 flex items-center gap-4 bg-white bg-opacity-90 px-4 py-2 rounded-full shadow-lg;
}

.nav-button {
  @apply p-1 rounded-full hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors duration-200;
}

.image-counter {
  @apply text-sm font-medium text-gray-700 min-w-[60px] text-center;
}

.image-history {
  @apply flex gap-2 overflow-x-auto p-2;
  scrollbar-width: thin;
}

.history-thumbnail {
  @apply w-20 h-20 rounded-lg overflow-hidden cursor-pointer border-2 border-transparent transition-all duration-200;
}

.history-thumbnail.active {
  @apply border-blue-500;
}

.history-thumbnail img {
  @apply w-full h-full object-cover;
}

.controls-area {
  /* @apply md:w-1/3 flex flex-col gap-4 overflow-y-auto p-4; */
}

.upload-section {
  @apply flex flex-col items-center gap-2 my-4;
}

.upload-label {
  @apply bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg cursor-pointer transition-colors duration-200;
}

.upload-hint {
  @apply text-gray-500 text-sm;
}

.prompt-inputs {
  @apply space-y-3;
}

.prompt-textarea {
  @apply w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-colors duration-200;
}

.advanced-settings-toggle {
  @apply my-4;
}

.toggle-button {
  @apply w-full flex items-center justify-between px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-gray-700 font-medium transition-colors duration-200;
}

.advanced-settings {
  @apply overflow-hidden transition-all duration-300 ease-in-out;
  max-height: 0;
}
.advanced-settings.settings-expanded {
  @apply max-h-[500px] py-4;
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .modal-content {
    @apply h-full max-h-none w-full rounded-none;
  }
  
  .content-area {
    @apply flex-col;
  }
  
  .preview-area,
  .controls-area {
    @apply w-full;
  }
}

.settings-title {
  @apply text-lg font-medium text-gray-700;
}

.settings-grid {
  @apply grid grid-cols-2 gap-4;
}

.setting-group {
  @apply flex flex-col gap-1;
}

.setting-group label {
  @apply text-sm text-gray-600;
}

.setting-group input {
  @apply p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200;
}

.action-buttons {
  @apply flex flex-col gap-2 mt-4;
}

.primary-button {
  @apply bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg flex items-center justify-center gap-2 transition-colors duration-200;
}

.secondary-button {
  @apply bg-yellow-500 hover:bg-yellow-600 text-white py-3 px-6 rounded-lg transition-colors duration-200;
}

.success-button {
  @apply bg-green-500 hover:bg-green-600 disabled:bg-gray-400 text-white py-3 px-6 rounded-lg transition-colors duration-200;
}

.error-message {
  @apply text-red-600 bg-red-50 p-3 rounded-lg mt-4;
}

.spinner {
  @apply w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin;
}

/* Custom Scrollbar Styles */
::-webkit-scrollbar {
  @apply w-2 h-2;
}

::-webkit-scrollbar-track {
  @apply bg-transparent;
}

::-webkit-scrollbar-thumb {
  @apply bg-gray-400 rounded-full hover:bg-gray-500;
}
.dimension-error {
  @apply text-red-600 text-sm mt-2;
}
.model-select {
  @apply p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors duration-200;
}
</style>