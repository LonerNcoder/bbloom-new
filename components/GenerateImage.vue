<template>
  <div class="ai-image-generator">
    <!-- Trigger Button -->
    <!-- <DialogTrigger asChild>
      <button class="trigger-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
          <circle cx="12" cy="13" r="3"></circle>
        </svg>
        Generate Image
      </button>
    </DialogTrigger> -->

    <!-- Generator Modal -->
    <DialogRoot  @open-change="handleModalOpenChange">
      <DialogTrigger asChild>
      <button class="trigger-button">
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="mr-2">
          <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"></path>
          <circle cx="12" cy="13" r="3"></circle>
        </svg>
        Generate Image
      </button>
    </DialogTrigger>
      <DialogPortal>
        <!-- <DialogOverlay :class="['generator-modal-overlay', isFullscreen ? 'fullscreen' : '']" /> -->
        <!-- <DialogContent :class="['modal-content', isFullscreen ? 'fullscreen-content' : '']"> -->
        <DialogOverlay class="bg-blackA9 data-[state=open]:animate-overlayShow fixed inset-0 z-30" />
        <DialogContent  class="data-[state=open]:animate-contentShow overflow-auto fixed top-[50%] left-[50%] max-h-[85vh] w-[90vw] max-w-[450px] translate-x-[-50%] translate-y-[-50%] rounded-[6px] bg-white p-[25px] shadow-[hsl(206_22%_7%_/_35%)_0px_10px_38px_-10px,_hsl(206_22%_7%_/_20%)_0px_10px_20px_-15px] focus:outline-none z-[100]" >
        <div class="modal-headers">
          <DialogTitle class="modal-title">
              {{ hasGeneratedImages ? 'Modify Image' : 'Generate Image' }}
          </DialogTitle>
          <!-- Modal Controls -->
          <div>
              <DialogClose asChild>
                <button class="modal-close">
                  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                  </svg>
                </button>
              </DialogClose>
          </div>
        </div>

        <!-- Main Content Area -->
        <div>
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
                <span class="upload-label-span">
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
                  class="toggle-button-svg"
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
        </DialogContent>
      </DialogPortal>
    </DialogRoot>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import {
  DialogRoot,
  DialogTrigger,
  DialogContent,
  DialogTitle,
  DialogDescription,
  DialogClose,
  DialogOverlay,
} from 'radix-vue';


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
  showModal.value = false; // Reset modal state as well
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
const handleModalOpenChange = (open) => {
  showModal.value = open;
  if (!open) {
    resetState();
  }
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
    handleModalOpenChange(false); // Close modal using handler to reset state
  }
};
</script>

<style scoped>
.ai-image-generator {
  position: relative;
  display: inline-block;
}

div#radix-vue-dialog-content-v-0-3 {
    overflow: auto;
}

.trigger-button {
  background-color: #3b82f6; /* bg-blue-500 */
  color: white; /* text-white */
  padding-left: 1rem; /* px-4 */
  padding-right: 1rem; /* px-4 */
  padding-top: 0.5rem; /* py-2 */
  padding-bottom: 0.5rem; /* py-2 */
  border-radius: 0.5rem; /* rounded-lg */
  display: flex;
  align-items: center;
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
  &:hover {
    background-color: #2563eb; /* hover:bg-blue-600 */
  }
}

.generator-modal-overlay {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.75); /* bg-black bg-opacity-75 */
  display: flex;
  align-items: center;
  justify-content: center;
}


.modal-content {
  background-color: white; /* bg-white */
  border-radius: 0.75rem; /* rounded-xl */
  padding: 1.5rem; /* p-6 */
  width: 91.666667%; /* w-11/12 */
  max-width: 80rem; /* max-w-7xl */
  height: 90vh; /* h-[90vh] */
  overflow: auto;
  position: relative;
  display: flex;
  flex-direction: column;
}

.modal-content.fullscreen-content {
  width: 100vw; /* w-screen */
  height: 100vh; /* h-screen */
  max-width: none; /* max-w-none */
  max-height: none; /* max-h-none */
  border-radius: 0 !important; /* rounded-none !important; */
}


.modal-headers {
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-direction: row;
}
.modal-title{
  font-size: large;
  font-weight: 600;
}
.modal-controls {
  display: flex;
  align-items: center;
  gap: 0.5rem; /* gap-2 */
  z-index: 10;
}

.fullscreen-toggle,
.modal-close {
  padding: 0.5rem; /* p-2 */
  border-radius: 0.5rem; /* rounded-lg */
  color: #6b7280; /* text-gray-500 */
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
  &:hover {
    color: #4b5563; /* hover:text-gray-700 */
    background-color: #f3f4f6; /* hover:bg-gray-100 */
  }
}


.image-preview {
  position: relative;
  background-color: #f3f4f6; /* bg-gray-100 */
  border-radius: 0.5rem; /* rounded-lg */
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 400px;
}

.preview-image {
  max-width: 100%; /* max-w-full */
  max-height: 60vh; /* max-h-[60vh] */
  object-fit: contain;
}

.navigation-controls {
  position: absolute;
  bottom: 1rem; /* bottom-4 */
  left: 50%; /* left-1/2 */
  transform: translateX(-50%); /* -translate-x-1/2 */
  display: flex;
  align-items: center;
  gap: 1rem; /* gap-4 */
  background-color: rgba(255, 255, 255, 0.9); /* bg-white bg-opacity-90 */
  padding-left: 1rem; /* px-4 */
  padding-right: 1rem; /* px-4 */
  padding-top: 0.5rem; /* py-2 */
  padding-bottom: 0.5rem; /* py-2 */
  border-radius: 9999px; /* rounded-full */
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1); /* shadow-lg */
}

.nav-button {
  padding: 0.25rem; /* p-1 */
  border-radius: 9999px; /* rounded-full */
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
  &:hover {
    background-color: #e5e7eb; /* hover:bg-gray-200 */
  }
  &:disabled {
    opacity: 0.5; /* disabled:opacity-50 */
    cursor: not-allowed; /* disabled:cursor-not-allowed */
  }
}

.image-counter {
  font-size: 0.875rem; /* text-sm */
  line-height: 1.25rem; /* leading-5 */
  font-weight: 500; /* font-medium */
  color: #4b5563; /* text-gray-700 */
  min-width: 60px; /* min-w-[60px] */
  text-align: center;
}

.image-history {
  display: flex;
  gap: 0.5rem; /* gap-2 */
  overflow-x: auto;
  padding: 0.5rem; /* p-2 */
  scrollbar-width: thin;
}

.history-thumbnail {
  width: 5rem; /* w-20 */
  height: 5rem; /* h-20 */
  border-radius: 0.5rem; /* rounded-lg */
  overflow: hidden;
  cursor: pointer;
  border-width: 2px; /* border-2 */
  border-color: transparent; /* border-transparent */
  transition-property: border-color, background-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
  &.active {
    border-color: #3b82f6; /* border-blue-500 */
  }
}

.history-thumbnail img {
  width: 100%; /* w-full */
  height: 100%; /* h-full */
  object-fit: cover;
}

.upload-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem; /* gap-2 */
  margin-top: 1rem; /* my-4 */
  margin-bottom: 1rem; /* my-4 */
}

.upload-label {
  background-color: #f3f4f6; /* bg-gray-100 */
  color: #4b5563; /* text-gray-700 */
  padding-left: 1.5rem; /* px-6 */
  padding-right: 1.5rem; /* px-6 */
  padding-top: 0.75rem; /* py-3 */
  padding-bottom: 0.75rem; /* py-3 */
  border-radius: 0.5rem; /* rounded-lg */
  cursor: pointer;
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
  &:hover {
    background-color: #e5e7eb; /* hover:bg-gray-200 */
  }
}
.upload-label-span {
  display: flex;
  align-items: center;
}

.upload-hint {
  color: #9ca3af; /* text-gray-500 */
  font-size: 0.875rem; /* text-sm */
  line-height: 1.25rem; /* leading-5 */
}

.prompt-inputs {
  display: flex;
  flex-direction: column;
  gap: 0.75rem; /* space-y-3 */
}

.prompt-textarea {
  width: 100%; /* w-full */
  padding: 0.75rem; /* p-3 */
  border-width: 1px; /* border */
  border-radius: 0.5rem; /* rounded-lg */
  transition-property: border-color, box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
  &:focus {
    outline: 2px solid transparent; /* focus:ring-2 */
    outline-offset: 2px;
    box-shadow: 0 0 0 2px #3b82f6; /* focus:ring-blue-500 */
    border-color: #3b82f6; /* focus:border-blue-500 */
  }
  resize: none; /* resize-none */
}

.advanced-settings-toggle {
  margin-top: 1rem; /* my-4 */
  margin-bottom: 1rem; /* my-4 */
}

.toggle-button {
  width: 100%; /* w-full */
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-left: 1rem; /* px-4 */
  padding-right: 1rem; /* px-4 */
  padding-top: 0.5rem; /* py-2 */
  padding-bottom: 0.5rem; /* py-2 */
  background-color: #f3f4f6; /* bg-gray-100 */
  color: #4b5563; /* text-gray-700 */
  border-radius: 0.5rem; /* rounded-lg */
  font-weight: 500; /* font-medium */
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
  &:hover {
    background-color: #e5e7eb; /* hover:bg-gray-200 */
  }
}
.toggle-button-svg {
  transition-property: transform;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
  &.rotate-180 {
    transform: rotate(180deg);
  }
}

.advanced-settings {
  overflow: hidden;
  transition-property: max-height, padding-top, padding-bottom;
  transition-timing-function: ease-in-out;
  transition-duration: 300ms;
  max-height: 0;
}
.advanced-settings.settings-expanded {
  max-height: 500px; /* approximate max height */
  padding-top: 1rem; /* py-4 */
  padding-bottom: 1rem; /* py-4 */
}

/* Responsive Adjustments */
@media (max-width: 768px) {
  .modal-content {
    height: 100%; /* h-full */
    max-height: none; /* max-h-none */
    width: 100%; /* w-full */
    border-radius: 0; /* rounded-none */
  }

  .content-area {
    flex-direction: column;
  }

  .preview-area,
  .controls-area {
    width: 100%; /* w-full */
  }
}

.settings-title {
  font-size: 1.125rem; /* text-lg */
  line-height: 1.75rem; /* leading-7 */
  font-weight: 500; /* font-medium */
  color: #4b5563; /* text-gray-700 */
}

.settings-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr)); /* grid-cols-2 */
  gap: 1rem; /* gap-4 */
}
.model-height-width {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
}
.model-height-width-group{
  display: flex;
  flex-direction: column;
  gap: 0.25rem; /* gap-1 */
}

.settings-group {
  display: flex;
  flex-direction: column;
  gap: 0.25rem; /* gap-1 */
}

.settings-group label {
  font-size: 0.875rem; /* text-sm */
  line-height: 1.25rem; /* leading-5 */
  color: #718096; /* text-gray-600 */
}

.settings-group input, .model-select {
  padding: 0.5rem; /* p-2 */
  border-width: 1px; /* border */
  border-radius: 0.5rem; /* rounded-lg */
  transition-property: border-color, box-shadow;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
  &:focus {
    outline: 2px solid transparent; /* focus:ring-2 */
    outline-offset: 2px;
    box-shadow: 0 0 0 2px #3b82f6; /* focus:ring-blue-500 */
    border-color: #3b82f6; /* focus:border-blue-500 */
  }
}


.action-buttons {
  display: flex;
  flex-direction: column;
  gap: 0.5rem; /* gap-2 */
  margin-top: 1rem; /* mt-4 */
}

.primary-button {
  background-color: #3b82f6; /* bg-blue-500 */
  color: white; /* text-white */
  padding-top: 0.75rem; /* py-3 */
  padding-bottom: 0.75rem; /* py-3 */
  padding-left: 1.5rem; /* px-6 */
  padding-right: 1.5rem; /* px-6 */
  border-radius: 0.5rem; /* rounded-lg */
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem; /* gap-2 */
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
  &:hover {
    background-color: #2563eb; /* hover:bg-blue-600 */
  }
  &:disabled {
    background-color: #9ca3af; /* disabled:bg-gray-400 */
  }
}

.secondary-button {
  background-color: #f59e0b; /* bg-yellow-500 */
  color: white; /* text-white */
  padding-top: 0.75rem; /* py-3 */
  padding-bottom: 0.75rem; /* py-3 */
  padding-left: 1.5rem; /* px-6 */
  padding-right: 1.5rem; /* px-6 */
  border-radius: 0.5rem; /* rounded-lg */
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
  &:hover {
    background-color: #d97706; /* hover:bg-yellow-600 */
  }
}

.success-button {
  background-color: #16a34a; /* bg-green-500 */
  color: white; /* text-white */
  padding-top: 0.75rem; /* py-3 */
  padding-bottom: 0.75rem; /* py-3 */
  padding-left: 1.5rem; /* px-6 */
  padding-right: 1.5rem; /* px-6 */
  border-radius: 0.5rem; /* rounded-lg */
  transition-property: background-color, border-color, color, fill, stroke, opacity, box-shadow, transform, filter, backdrop-filter;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
  transition-duration: 200ms;
  &:hover {
    background-color: #15803d; /* hover:bg-green-600 */
  }
  &:disabled {
    background-color: #9ca3af; /* disabled:bg-gray-400 */
  }
}

.error-message {
  color: #b91c1c; /* text-red-600 */
  background-color: #fef2f2; /* bg-red-50 */
  padding: 0.75rem; /* p-3 */
  border-radius: 0.5rem; /* rounded-lg */
  margin-top: 1rem; /* mt-4 */
}

.spinner {
  width: 1.25rem; /* w-5 */
  height: 1.25rem; /* h-5 */
  border-width: 2px; /* border-2 */
  border-color: white; /* border-white */
  border-top-color: transparent; /* border-t-transparent */
  border-radius: 9999px; /* rounded-full */
  animation: spin 1s linear infinite; /* animate-spin */
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* Custom Scrollbar Styles */
::-webkit-scrollbar {
  width: 0.5rem; /* w-2 */
  height: 0.5rem; /* h-2 */
}

::-webkit-scrollbar-track {
  background-color: transparent; /* bg-transparent */
}

::-webkit-scrollbar-thumb {
  background-color: #a8a29e; /* bg-gray-400 */
  border-radius: 9999px; /* rounded-full */
  &:hover {
    background-color: #78716c; /* hover:bg-gray-500 */
  }
}
.dimension-error {
  color: #b91c1c; /* text-red-600 */
  font-size: 0.875rem; /* text-sm */
  margin-top: 0.5rem; /* mt-2 */
}
</style>