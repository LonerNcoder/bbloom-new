<template>
  <!-- Floating Button (Mobile or Desktop) -->
  <div ref="draggableRef" :style="buttonStyle as CSSProperties" @pointerdown="startDragging" @click.stop="togglePanel">
      <div class="absolute inset-0 w-16 h-16 -m-4 rounded-full" :class="{ 'bg-gray-500/10': isDragging }"></div>

      <!-- Settings Button -->
      <button
          ref="buttonRef"
          class="p-3 rounded-full bg-blue-600 text-white shadow-lg hover:bg-blue-700 transition-all"
      >
          <Settings @blur="() => handleClickOutside" class="w-6 h-6" />
      </button>
  </div>

  <!-- Full Screen Transparent Overlay -->
  <Transition name="fade">
      <div v-if="isOpen" class="overlay" @click="handleClickOutside"></div>
  </Transition>

  <!-- Settings Panel -->
  <Transition name="fade">
      <div
          v-if="isOpen"
          ref="panelRef"
          :style="panelPositionComputed"
          class="fixed bg-white rounded-lg shadow-xl p-4 w-64 space-y-4 z-50"
          @click.stop
      >
          <!-- Background Color -->
          <div class="space-y-2">
              <label class="flex items-center gap-2 text-sm font-medium">
                  <Palette class="w-4 h-4" />
                  Background Color
              </label>
              <input type="color" v-model="currentBackgroundColor" class="w-full h-8 rounded cursor-pointer" />
          </div>

          <!-- Font Color -->
          <div class="space-y-2">
              <label class="flex items-center gap-2 text-sm font-medium">
                  <Palette class="w-4 h-4" />
                  Font Color
              </label>
              <input type="color" v-model="currentFontColor" class="w-full h-8 rounded cursor-pointer" />
          </div>

          <!-- Font Size -->
          <div class="space-y-2">
              <label class="flex items-center gap-2 text-sm font-medium">
                  <Type class="w-4 h-4" />
                  Font Size ({{ currentFontSize }}px)
              </label>
              <input type="range" min="10" max="30" step="1" v-model="currentFontSize" class="w-full" />
          </div>

          <!-- Brightness -->
          <div class="space-y-2">
              <label class="flex items-center gap-2 text-sm font-medium">
                  <Sun class="w-4 h-4" />
                  Brightness ({{ currentBrightness }}%)
              </label>
              <input type="range" min="60" step="10" max="150" v-model="currentBrightness" class="w-full" />
          </div>

          <!-- Gesture Toggle -->
          <div class="flex text-sm items-center gap-2">
              Gesture Control
              <Hand class="w-4 h-4" />
              <label class="relative inline-flex items-center cursor-pointer">
                  <input type="checkbox" v-model="isGestureEnabled" class="sr-only peer">
                  <div
                      class="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"
                  ></div>
              </label>
          </div>

          <!-- Bookmark -->
          <button @click="toggleBookmark" class="flex items-center gap-2 w-full p-2 rounded hover:bg-gray-100">
              <Bookmark :class="`w-4 h-4 ${bookmarked ? 'fill-current' : ''}`" />
              <span class="text-sm font-medium">
                  {{ bookmarked ? 'Bookmarked' : 'Add Bookmark' }}
              </span>
          </button>

          <!-- Summarize -->
          <button @click="handleSummarize" class="flex items-center gap-2 w-full p-2 rounded bg-blue-50 hover:bg-blue-100">
              <FileText class="w-4 h-4" />
              <span class="text-sm font-medium">Summarize Chapter</span>
          </button>
      </div>
  </Transition>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, onBeforeUnmount, watch, computed, type CSSProperties } from 'vue';
import { Settings, Type, Sun, Bookmark, FileText, Palette, Hand } from 'lucide-vue-next';

interface FloatingSettingsProps {
  fontsize: number;
  backgroundColor: string;
  brightness: number;
  bookmark: boolean;
  isMobile: boolean;
  isButtonVisible: boolean;
  gestureEnabled: boolean;
  fontColor: string; // Add fontColor prop
}
const props = defineProps<FloatingSettingsProps>();

const currentFontSize = ref(props.fontsize);
const currentBackgroundColor = ref(props.backgroundColor);
const currentBrightness = ref(props.brightness);
const bookmarked = ref(props.bookmark);
const isGestureEnabled = ref(props.gestureEnabled);
const isMobile = ref(window.innerWidth <= 768);
const currentFontColor = ref(props.fontColor || '#000000'); // Default to black if not provided

const emit = defineEmits(['bookmark', 'summarize', 'fontsizeChanged', 'brightnessChanged', 'backgroundChanged', 'gesture', 'fontColorChanged']); // Add fontColorChanged

watch(currentFontSize, (newValue) => emit('fontsizeChanged', newValue));
watch(currentBrightness, (newValue) => emit('brightnessChanged', newValue));
watch(currentBackgroundColor, (newValue) => emit('backgroundChanged', newValue));
watch(bookmarked, (newValue) => emit('bookmark', newValue));
watch(isGestureEnabled, (newValue) => emit('gesture', newValue));
watch(currentFontColor, (newValue) => emit('fontColorChanged', newValue)); // Emit font color changes


// New state for mobile expansion
const isExpanded = ref(false);

const draggableRef = ref<HTMLElement | null>(null);
const buttonRef = ref<HTMLElement | null>(null);
const panelRef = ref<HTMLElement | null>(null);
const isOpen = ref(false);
const isDragging = ref(false);
const isButtonVisible = ref(props.isButtonVisible);

// Position state
const position = reactive({ x: 0, y: 0 });

const initializePosition = () => {
  const storageKey = isMobile.value
      ? 'mobile_pos_floatingButtonPosition'
      : 'floatingButtonPosition';

  const savedPosition = localStorage.getItem(storageKey);

  if (savedPosition) {
      try {
          const parsedPosition = JSON.parse(savedPosition);
          position.x = parsedPosition.x;
          position.y = parsedPosition.y;
      } catch (error) {
          if (isMobile.value) {
              const btnWidth = 56;
              position.x = window.innerWidth - btnWidth / 2;
              position.y = window.innerHeight - btnWidth - 20;
          } else {
              position.x = window.innerWidth - 80;
              position.y = window.innerHeight - 80;
          }
      }
  } else {
      if (isMobile.value) {
          const btnWidth = 56;
          position.x = window.innerWidth - btnWidth / 2;
          position.y = window.innerHeight - btnWidth - 20;
      } else {
          position.x = window.innerWidth - 80;
          position.y = window.innerHeight - 80;
      }
  }
};


const buttonStyle = computed(() => {
  if (isMobile.value) {
      const offsetX = isExpanded.value ? -10 : 0;
      return {
          position: 'fixed',
          left: position.x + offsetX + 'px',
          top: position.y + 'px',
          zIndex: 50000,
          touchAction: 'none',
          opacity: isButtonVisible.value ? 1 : 0,
          transition: 'left 0.3s'
      };
  } else {
      return {
          position: 'fixed',
          left: position.x + 'px',
          top: position.y + 'px',
          zIndex: 50000,
          touchAction: 'none',
          opacity: isButtonVisible.value ? 1 : 0
      };
  }
});

const panelPositionComputed = computed(() => {
  const dummy = position.x + position.y
  const buttonRect = draggableRef.value?.getBoundingClientRect();
  if (!buttonRect) return {};

  const windowWidth = window.innerWidth;
  const windowHeight = window.innerHeight;
  const PANEL_MARGIN = 16;
  const PANEL_WIDTH = 256;
  const PANEL_HEIGHT = 450;

  let left = 0, top = 0;

  if (isMobile.value) {
      // Mobile-specific logic: try placing panel to the left first.
      left = buttonRect.left - PANEL_WIDTH - PANEL_MARGIN;
      top = buttonRect.top;

      // If there isn’t enough space on the left, place the panel to the right.
      if (left < PANEL_MARGIN) {
          left = buttonRect.right + PANEL_MARGIN;
      }
      // Clamp the top value to ensure the panel remains visible.
      top = Math.max(PANEL_MARGIN, Math.min(top, windowHeight - PANEL_HEIGHT - PANEL_MARGIN));
  } else {
      // Desktop logic remains unchanged.
      const spaceRight = windowWidth - (buttonRect.right + PANEL_MARGIN);
      const spaceLeft = buttonRect.left - PANEL_MARGIN - PANEL_WIDTH;
      const spaceTop = buttonRect.top - PANEL_MARGIN - PANEL_HEIGHT;

      if (spaceRight >= PANEL_WIDTH) {
          left = buttonRect.right + PANEL_MARGIN;
          top = Math.min(
              Math.max(PANEL_MARGIN, buttonRect.top - PANEL_HEIGHT / 2 + buttonRect.height / 2),
              windowHeight - PANEL_HEIGHT - PANEL_MARGIN
          );
      } else if (spaceLeft >= PANEL_WIDTH) {
          left = buttonRect.left - PANEL_MARGIN - PANEL_WIDTH;
          top = Math.min(
              Math.max(PANEL_MARGIN, buttonRect.top - PANEL_HEIGHT / 2 + buttonRect.height / 2),
              windowHeight - PANEL_HEIGHT - PANEL_MARGIN
          );
      } else if (spaceTop >= PANEL_HEIGHT) {
          left = Math.min(
              Math.max(PANEL_MARGIN, buttonRect.left - PANEL_WIDTH / 2 + buttonRect.width / 2),
              windowWidth - PANEL_WIDTH - PANEL_MARGIN
          );
          top = buttonRect.top - PANEL_MARGIN - PANEL_HEIGHT;
      } else {
          left = Math.min(
              Math.max(PANEL_MARGIN, buttonRect.left - PANEL_WIDTH / 2 + buttonRect.width / 2),
              windowWidth - PANEL_WIDTH - PANEL_MARGIN
          );
          top = buttonRect.bottom + PANEL_MARGIN;
      }
  }

  return {
      left: `${left}px`,
      top: `${top}px`,
      transform: 'none'
  };
});

const DRAG_THRESHOLD = 5;
let dragStarted = false;
const dragState = reactive({
  startX: 0,
  startY: 0,
  isDragging: false,
  initialX: 0,
  initialY: 0
});

const startDragging = (event: PointerEvent) => {
  if (event.target === buttonRef.value) {
      if (isMobile.value) {
          isExpanded.value = !isExpanded.value;
          isOpen.value = isExpanded.value;
          return;
      }
  }

  dragState.startX = event.clientX;
  dragState.startY = event.clientY;
  dragState.initialX = position.x;
  dragState.initialY = position.y;

  document.addEventListener('pointermove', handleDrag);
  document.addEventListener('pointerup', stopDragging);
};

const handleDrag = (event: PointerEvent) => {
  const dx = Math.abs(event.clientX - dragState.startX);
  const dy = Math.abs(event.clientY - dragState.startY);

  if (!dragStarted && (dx > DRAG_THRESHOLD || dy > DRAG_THRESHOLD)) {
      dragStarted = true;
      isDragging.value = true;
      dragState.isDragging = true;
  }

  if (!dragState.isDragging) return;

  const newDx = event.clientX - dragState.startX;
  const newDy = event.clientY - dragState.startY;

  position.x = dragState.initialX + newDx;
  position.y = dragState.initialY + newDy;

  const button = draggableRef.value;
  if (button) {
      const rect = button.getBoundingClientRect();
      position.x = Math.min(Math.max(0, position.x), window.innerWidth - rect.width);
      position.y = Math.min(Math.max(0, position.y), window.innerHeight - rect.height);
  }
};

const stopDragging = () => {
  isDragging.value = false;
  dragState.isDragging = false;
  dragStarted = false;
  document.removeEventListener('pointermove', handleDrag);
  document.removeEventListener('pointerup', stopDragging);

  if (isMobile.value && draggableRef.value) {
      const btnWidth = draggableRef.value.offsetWidth;
      const middle = window.innerWidth / 2;
      if (position.x + btnWidth / 2 < middle) {
          position.x = isExpanded.value ? 0 : -(btnWidth / 2);
      } else {
          position.x = isExpanded.value
              ? window.innerWidth - btnWidth
              : window.innerWidth - btnWidth / 2;
      }
  }

  const storageKey = isMobile.value
      ? 'mobile_pos_floatingButtonPosition'
      : 'floatingButtonPosition';

  localStorage.setItem(storageKey, JSON.stringify({
      x: position.x,
      y: position.y
  }));
};

const togglePanel = () => {
  if (!isDragging.value) {
      if (isMobile.value) {
          isOpen.value = !isOpen.value;
          isExpanded.value = !isExpanded.value;
      } else {
          isOpen.value = !isOpen.value;
      }
  }
};

const handleClickOutside = (event: MouseEvent) => {
  if (!isOpen.value) return;

  if (draggableRef.value && draggableRef.value.contains(event.target as Node)) {
      return;
  }
  isOpen.value = false;
  isExpanded.value = false;
};

const toggleBookmark = () => {
  bookmarked.value = !bookmarked.value;
  emit('bookmark', bookmarked.value);
};

const handleSummarize = () => {
  emit('summarize', {});
};

const updatePanelPosition = () => {
  position.x = position.x;
  position.y = position.y;
  initializePosition()
};
watch([() => position.x, () => position.y], () => {
  if (draggableRef.value) {
      draggableRef.value.style.left = `${position.x}px`;
      draggableRef.value.style.top = `${position.y}px`;
  }
});

watch(() => props.isMobile, (newVal) => {
  initializePosition();
});

const handleResize = () => {
  isMobile.value = window.innerWidth <= 768;
  // Optionally reinitialize position if needed:
  initializePosition();
};

onMounted(() => {
  initializePosition();
  document.addEventListener('click', handleClickOutside);
  window.addEventListener('resize', handleResize);
});

onBeforeUnmount(() => {
  document.removeEventListener('click', handleClickOutside);
  window.removeEventListener('resize', handleResize);
});
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease, opacity 0.3s ease;
}
.slide-enter-from,
.slide-leave-to {
  transform: translateX(20px);
  opacity: 0;
}
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Full Screen Overlay Style */
.overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 40;
  /* Make sure this is lower than the panel's z-index */
  background-color: rgba(0, 0, 0, 0);
  /* Fully transparent */
}
</style>