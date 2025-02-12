<template>
    <div 
      class="relative w-48 h-64 group"
      @mouseenter="showOptions = true"
      @mouseleave="showOptions = false"
    >
      <img
        :src="resetImage || coverImage"
        :alt="title"
        class="w-full h-full object-cover rounded-lg shadow-md"
      />
      
      <!-- Hover Options -->
      <div 
        v-if="showOptions"
        class="absolute top-2 right-2 flex flex-col gap-2 bg-[var(--novelcoverimage-overlay-bg)] backdrop-blur-sm p-2 rounded-md"
      >
        <button
          @click="handleImageEdit"
          class="p-2 bg-[var(--novelcoverimage-button-bg)] rounded-full hover:bg-[var(--novelcoverimage-button-hover-bg)] transition-colors"
        >
          <Edit class="w-4 h-4 text-[var(--novelcoverimage-button-icon)]" />
        </button>
        <button
          @click="handleDownload"
          class="p-2 bg-[var(--novelcoverimage-button-bg)] rounded-full hover:bg-[var(--novelcoverimage-button-hover-bg)] transition-colors"
        >
          <Download class="w-4 h-4 text-[var(--novelcoverimage-button-icon)]" />
        </button>
      </div>
  
      <!-- Edit Modal -->
      <GeneratingAnimation v-if="handleingGenImage"></GeneratingAnimation>
      <DialogRoot v-else :open="isEditModalOpen" @update:open="handleModalChange">
        <DialogPortal>
          <DialogOverlay class="fixed inset-0 bg-[var(--novelcoverimage-overlay-bg)] backdrop-blur-[2px]" />
          <DialogContent class="fixed top-[50%] left-[50%] translate-x-[-50%] translate-y-[-50%] w-[90vw] max-w-2xl max-h-[85vh] bg-[var(--novelcoverimage-modal-bg)] rounded-xl shadow-lg border border-[var(--novelcoverimage-border)] p-6">
            <div class="flex justify-between items-center mb-6">

              <DialogTitle class="text-xl font-semibold text-[var(--novelcoverimage-text)]">
                Edit Cover Image
              </DialogTitle>
              <DialogClose class="rounded-full p-1.5 hover:bg-[var(--novelcoverimage-close-hover)] transition-colors">
                <X @click="isEditModalOpen = false" class="w-5 h-5 text-[var(--novelcoverimage-text)]" />
              </DialogClose>
            </div>
  
            <!-- Tabs -->
            <TabsRoot v-model="activeTab" class="w-full">
              <TabsList class="flex gap-2 mb-6 bg-[var(--novelcoverimage-tabs-bg)] p-1 rounded-lg">
                <TabsTrigger 
                  v-for="tab in tabs" 
                  :key="tab.value"
                  :value="tab.value"
                  class="flex-1 px-4 py-2 rounded-md text-[var(--novelcoverimage-text)] data-[state=active]:bg-[var(--novelcoverimage-tab-active)] data-[state=active]:text-[var(--novelcoverimage-text-active)]"
                >
                  {{ tab.label }}
                </TabsTrigger>
              </TabsList>
  
              <!-- Upload Tab -->
              <TabsContent value="upload">
                <div class="flex items-center justify-center w-full">
                  <label class="flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-[var(--novelcoverimage-border)] rounded-lg cursor-pointer hover:bg-[var(--novelcoverimage-upload-hover)]">
                    <div class="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload class="w-8 h-8 mb-4 text-[var(--novelcoverimage-text)]" />
                      <p class="mb-2 text-sm text-[var(--novelcoverimage-text)]">
                        Click to upload or drag and drop
                      </p>
                    </div>
                    <input 
                      type="file" 
                      class="hidden" 
                      accept="image/*" 
                      @change="handleFileUpload"
                    />
                  </label>
                </div>
              </TabsContent>
  
              <!-- Crop Tab -->
              <TabsContent value="crop">
                <div v-if="cropImage" class="h-[400px]">
                  <VueCropper
                    ref="cropper"
                    :src="cropImage"
                    :aspect-ratio="3/4"
                    :view-mode="2"
                    :background="false"
                    :auto-crop-area="1"
                    :responsive="true"
                    :guides="true"
                    :center="true"
                    :highlight="true"
                    :crop-box-movable="true"
                    :crop-box-resizable="true"
                    :toggle-drag-mode-on-dblclick="false"
                  />
                  <div class="flex justify-end gap-2 mt-4">
                    <button
                      @click="rotateCrop(-90)"
                      class="px-4 py-2 rounded-md bg-[var(--novelcoverimage-button-bg)] text-[var(--novelcoverimage-text)] hover:bg-[var(--novelcoverimage-button-hover-bg)]"
                    >
                      Rotate Left
                    </button>
                    <button
                      @click="rotateCrop(90)"
                      class="px-4 py-2 rounded-md bg-[var(--novelcoverimage-button-bg)] text-[var(--novelcoverimage-text)] hover:bg-[var(--novelcoverimage-button-hover-bg)]"
                    >
                      Rotate Right
                    </button>
                    <button
                      @click="applyCrop"
                      class="px-4 py-2 rounded-md bg-[var(--novelcoverimage-primary)] text-white hover:bg-[var(--novelcoverimage-primary-hover)]"
                    >
                      Apply Crop
                    </button>
                  </div>
                </div>
                <div v-else class="text-center py-8 text-[var(--novelcoverimage-text)]">
                  Please upload an image first to crop
                </div>
              </TabsContent>
  
              <!-- Generate Tab -->
              <TabsContent value="generate">
                <GenerateImage @final-image="handleGeneratedImage" />
              </TabsContent>
            </TabsRoot>
          </DialogContent>
        </DialogPortal>
      </DialogRoot>
    </div>
  </template>


  <script setup>
import { ref } from 'vue'
import { Edit, Download, Upload, X } from 'lucide-vue-next'
import {
  DialogRoot,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  DialogTitle,
  DialogClose,
} from 'radix-vue'
import {
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
} from 'radix-vue'
import VueCropper from 'vue-cropperjs'
import 'cropperjs/dist/cropper.css'
  const {$store} = useNuxtApp();
//   import GenerateImage from './GenerateImage.vue'
  
  const props = defineProps({
    coverImage: {
      type: String,
      required: true
    },
    resetImage: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      required: true
    }
  })
  
  const emit = defineEmits(['update:image'])
  
  const showOptions = ref(false)
    const isEditModalOpen = ref(false)
    const activeTab = ref('upload')
    const cropImage = ref(null)
    const cropper = ref(null)
    const handleingGenImage = ref(false)

    const tabs = [
    { value: 'upload', label: 'Upload' },
    { value: 'crop', label: 'Crop' },
    { value: 'generate', label: 'AI Generate' }
    ]


    const handleModalChange = (isOpen) => {
        isEditModalOpen.value = isOpen
        if (!isOpen) {
            cropImage.value = null
            activeTab.value = 'upload'
        }
    }
  const handleDownload = async () => {
    try {
      const response = await fetch(props.coverImage)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = `${props.title}-cover.jpg`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Error downloading image:', error)
    }
  }
  
  const handleImageEdit = () => {
    isEditModalOpen.value = true
    showOptions.value = false
  }
  
  const handleFileUpload = async (event) => {
  
  const file = event.target.files[0];
  if (!file) return;

  try {
    // Step 1: Read the file as a Blob
    const blob = await file.arrayBuffer().then((buffer) => new Blob([buffer], { type: file.type }));

    // Step 2: Compress the image to less than 150 KB
    const compressedBlob = await compressImage(blob, 150); // 150 KB max size

    // Step 3: Upload the compressed image to a CDN
    const cdnUrl = await uploadToCDN(compressedBlob);

    // Step 4: Emit the CDN URL and close the modal
    emit('update:image', cdnUrl);
    isEditModalOpen.value = false;
    console.log('Image uploaded to CDN:', cdnUrl);
  } catch (error) {
    console.error('Error handling file upload:', error);
  }
};
  


  const handleGeneratedImage = async (imageUrl) => {
      handleingGenImage.value = true
      try {
        // Step 1: Fetch the image as a Blob
        const response = await fetch(imageUrl);
        const blob = await response.blob();

        // Step 2: Compress the image to less than 150 KB
        const compressedBlob = await compressImage(blob, 150); // 150 KB max size

        // Step 3: Upload the compressed image to a CDN
        const cdnUrl = await uploadToCDN(compressedBlob);

        // Step 4: Update the finalImage value with the CDN link
        emit('update:image', cdnUrl)
        isEditModalOpen.value = false
        console.log('Final image uploaded to CDN:', cdnUrl);
      } catch (error) {
        console.error('Error handling final image:', error);
      }finally{
        handleingGenImage.value = false
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
      const headers = await $store.getFormHeaders()
      formData.append('image', blob);
      try {
        const data = await $fetch(`${API}upload/image`, {
          headers: headers,
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

    const rotateCrop = (degree) => {
    if (cropper.value) {
        cropper.value.rotate(degree)
    }
    }

    const applyCrop = () => {
        if (cropper.value) {
            const canvas = cropper.value.getCroppedCanvas()
            const croppedImage = canvas.toDataURL('image/jpeg')
            emit('update:image', croppedImage)
            isEditModalOpen.value = false
        }
    }

  </script>
  
<style>
:root {
  --novelcoverimage-text: var(--primary-text-color);
  --novelcoverimage-text-active: var(--primary-text-color);
  --novelcoverimage-overlay-bg: rgba(0, 0, 0, 0.4);
  --novelcoverimage-button-bg: white;
  --novelcoverimage-button-hover-bg: #f3f4f6;
  --novelcoverimage-button-icon: #374151;
  --novelcoverimage-modal-bg: var(--card-bg-color);
  --novelcoverimage-border: #e5e7eb;
  --novelcoverimage-close-hover: rgba(0, 0, 0, 0.05);
  --novelcoverimage-tabs-bg: rgba(0, 0, 0, 0.05);
  --novelcoverimage-tab-active: white;
  --novelcoverimage-upload-hover: rgba(0, 0, 0, 0.02);
  --novelcoverimage-primary: #2563eb;
  --novelcoverimage-primary-hover: #1d4ed8;
}

.dark {
  --novelcoverimage-text: #e5e7eb;
  --novelcoverimage-text-active: white;
  --novelcoverimage-button-bg: rgba(255, 255, 255, 0.1);
  --novelcoverimage-button-hover-bg: rgba(255, 255, 255, 0.2);
  --novelcoverimage-button-icon: #e5e7eb;
  --novelcoverimage-border: #374151;
  --novelcoverimage-close-hover: rgba(255, 255, 255, 0.1);
  --novelcoverimage-tabs-bg: rgba(255, 255, 255, 0.05);
  --novelcoverimage-tab-active: rgba(255, 255, 255, 0.1);
  --novelcoverimage-upload-hover: rgba(255, 255, 255, 0.05);
}

/* Cropper.js custom styles */
.cropper-view-box,
.cropper-face {
  border-radius: 0;
}

.cropper-modal {
  background-color: var(--novelcoverimage-overlay-bg);
}
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.3s ease;
  }
  
  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }
  </style>