<script setup lang="ts">
import { SplitterGroup, SplitterPanel, SplitterResizeHandle } from 'radix-vue';
import { ref, watch, onMounted, computed } from 'vue';

definePageMeta({
  layout: false
})

interface PanelSettings {
  backgroundColor: string;
  textColor: string;
  fontFamily: string;
  fontSize: string;
  panelSize?: number;
}

interface SplitterSettings {
  sizes: number[];
}

// Default settings
const defaultPanelSettings: PanelSettings = {
  backgroundColor: 'white',
  textColor: 'black',
  fontFamily: 'sans-serif',
  fontSize: '14px',
};

// Refs for panel settings
const panelASettings = ref<PanelSettings>({ ...defaultPanelSettings });
const panelBSettings = ref<PanelSettings>({ ...defaultPanelSettings });
const panelCSettings = ref<PanelSettings>({ ...defaultPanelSettings });

// Refs for splitter sizes
const horizontalSplitterSettings = ref<SplitterSettings>({ sizes: [33, 67] });
const verticalSplitterSettings = ref<SplitterSettings>({ sizes: [50, 50] });

// Refs for modal open state (using modalOpen prop)
const panelAModalOpen = ref(false);
const panelBModalOpen = ref(false);
const panelCModalOpen = ref(false);

// --- Panel A: Browser Functionality ---
const panelAUrl = ref('https://duckduckgo.com/'); // Initial URL
const panelASearchInput = ref('');

const handlePanelASearch = () => {
  let url = panelASearchInput.value;
  // Basic URL validation and formatting
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = 'https://duckduckgo.com/?q=' + encodeURIComponent(url); // Default to Google search
  }
  panelAUrl.value = url;
};

const handlePanelAKeyDown = (event: KeyboardEvent) => {
  if (event.key === 'Enter') {
    handlePanelASearch();
  }
};

// --- LocalStorage Functions ---

function saveSettingsToLocalStorage() {
  localStorage.setItem('panelASettings', JSON.stringify(panelASettings.value));
  localStorage.setItem('panelBSettings', JSON.stringify(panelBSettings.value));
  localStorage.setItem('panelCSettings', JSON.stringify(panelCSettings.value));
  localStorage.setItem('horizontalSplitterSettings', JSON.stringify(horizontalSplitterSettings.value));
  localStorage.setItem('verticalSplitterSettings', JSON.stringify(verticalSplitterSettings.value));
}

function loadSettingsFromLocalStorage() {
  const loadSetting = (key: string, settingRef: any) => {
    const item = localStorage.getItem(key);
    if (item) settingRef.value = JSON.parse(item);
  };

  loadSetting('panelASettings', panelASettings);
  loadSetting('panelBSettings', panelBSettings);
  loadSetting('panelCSettings', panelCSettings);
  loadSetting('horizontalSplitterSettings', horizontalSplitterSettings);
  loadSetting('verticalSplitterSettings', verticalSplitterSettings);
}

// --- Watchers and Lifecycle Hook ---

watch([panelASettings, panelBSettings, panelCSettings, horizontalSplitterSettings, verticalSplitterSettings],
  saveSettingsToLocalStorage, { deep: true });

onMounted(loadSettingsFromLocalStorage);

// --- Event Handlers for Splitter Resizing ---

const onHorizontalResize = (sizes: number[]) => horizontalSplitterSettings.value.sizes = sizes;
const onVerticalResize = (sizes: number[]) => verticalSplitterSettings.value.sizes = sizes;

// --- Computed Styles ---

const panelAStyle = computed(() => ({
  backgroundColor: panelASettings.value.backgroundColor,
  color: panelASettings.value.textColor,
  fontFamily: panelASettings.value.fontFamily,
  fontSize: panelASettings.value.fontSize,
}));

const panelBStyle = computed(() => ({
  backgroundColor: panelBSettings.value.backgroundColor,
  color: panelBSettings.value.textColor,
  fontFamily: panelBSettings.value.fontFamily,
  fontSize: panelBSettings.value.fontSize,
}));

const panelCStyle = computed(() => ({
  backgroundColor: panelCSettings.value.backgroundColor,
  color: panelCSettings.value.textColor,
  fontFamily: panelCSettings.value.fontFamily,
  fontSize: panelCSettings.value.fontSize,
}));

// --- No longer using a render function, settings content directly in template ---

</script>

<template>
  <div class="w-full h-screen px-8 py-4">
    <SplitterGroup
      id="splitter-group-1"
      direction="horizontal"
      :model-value="horizontalSplitterSettings.sizes"
      @update:model-value="onHorizontalResize"
    >
      <SplitterPanel
        id="splitter-group-1-panel-1"
        :min-size="20"
        :style="panelAStyle"
        class="rounded-xl flex flex-col items-center justify-center p-4 relative"
      >
        <button @click="panelAModalOpen = true" class="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 transition-colors">
          <Icon name="mdi:cog" class="text-xl" />
        </button>
        <WallModal
          v-model:modalOpen="panelAModalOpen"
          title="Panel A Settings"
          description="Customize Panel A"
        >
          <div class="grid gap-4 py-4">
            <div class="grid grid-cols-4 items-center gap-4">
              <label htmlFor="panel-a-bg-color" class="text-right">Background</label>
              <input id="panel-a-bg-color" type="color" v-model="panelASettings.backgroundColor" class="col-span-3 h-10 rounded-md border border-gray-300 px-2 py-1" />
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
              <label htmlFor="panel-a-text-color" class="text-right">Text Color</label>
              <input id="panel-a-text-color" type="color" v-model="panelASettings.textColor" class="col-span-3 h-10 rounded-md border border-gray-300 px-2 py-1" />
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
              <label htmlFor="panel-a-font-family" class="text-right">Font Family</label>
              <input id="panel-a-font-family" type="text" v-model="panelASettings.fontFamily" class="col-span-3 rounded-md border border-gray-300 px-2 py-1" />
            </div>
            <div class="grid grid-cols-4 items-center gap-4">
              <label htmlFor="panel-a-font-size" class="text-right">Font Size</label>
              <input id="panel-a-font-size" type="text" v-model="panelASettings.fontSize" class="col-span-3 rounded-md border border-gray-300 px-2 py-1" />
            </div>
          </div>
        </WallModal>
        Panel A
      </SplitterPanel>

      <SplitterResizeHandle
        id="splitter-group-1-resize-handle-1"
        class="w-2 bg-gray-300 hover:bg-gray-400 transition-colors"
      />

      <SplitterPanel
        id="splitter-group-1-panel-2"
        :min-size="20"
      >
        <SplitterGroup
          id="splitter-group-2"
          direction="vertical"
          :model-value="verticalSplitterSettings.sizes"
          @update:model-value="onVerticalResize"
        >
          <SplitterPanel
            id="splitter-group-2-panel-1"
            :min-size="20"
            :style="panelBStyle"
            class="rounded-xl flex items-center justify-center p-4 relative"
          >
            <button @click="panelBModalOpen = true" class="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 transition-colors">
              <Icon name="mdi:cog" class="text-xl" />
            </button>
            <WallModal
              v-model:modalOpen="panelBModalOpen"
              title="Panel B Settings"
              description="Customize Panel B"
            >
              <div class="grid gap-4 py-4">
                <div class="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="panel-b-bg-color" class="text-right">Background</label>
                  <input id="panel-b-bg-color" type="color" v-model="panelBSettings.backgroundColor" class="col-span-3 h-10 rounded-md border border-gray-300 px-2 py-1" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="panel-b-text-color" class="text-right">Text Color</label>
                  <input id="panel-b-text-color" type="color" v-model="panelBSettings.textColor" class="col-span-3 h-10 rounded-md border border-gray-300 px-2 py-1" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="panel-b-font-family" class="text-right">Font Family</label>
                  <input id="panel-b-font-family" type="text" v-model="panelBSettings.fontFamily" class="col-span-3 rounded-md border border-gray-300 px-2 py-1" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="panel-b-font-size" class="text-right">Font Size</label>
                  <input id="panel-b-font-size" type="text" v-model="panelBSettings.fontSize" class="col-span-3 rounded-md border border-gray-300 px-2 py-1" />
                </div>
              </div>
            </WallModal>
            Panel B
          </SplitterPanel>

          <SplitterResizeHandle
            id="splitter-group-2-resize-handle-1"
            class="h-2 bg-gray-300 hover:bg-gray-400 transition-colors"
          />

          <SplitterPanel
            id="splitter-group-2-panel-2"
            :min-size="20"
            :style="panelCStyle"
            class="rounded-xl flex items-center justify-center p-4 relative"
          >
            <button @click="panelCModalOpen = true" class="absolute top-2 right-2 p-1 rounded-full hover:bg-gray-200 transition-colors">
              <Icon name="mdi:cog" class="text-xl" />
            </button>
             <WallModal
              v-model:modalOpen="panelCModalOpen"
              title="Panel C Settings"
              description="Customize Panel C"
            >
              <div class="grid gap-4 py-4">
                <div class="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="panel-c-bg-color" class="text-right">Background</label>
                  <input id="panel-c-bg-color" type="color" v-model="panelCSettings.backgroundColor" class="col-span-3 h-10 rounded-md border border-gray-300 px-2 py-1" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="panel-c-text-color" class="text-right">Text Color</label>
                  <input id="panel-c-text-color" type="color" v-model="panelCSettings.textColor" class="col-span-3 h-10 rounded-md border border-gray-300 px-2 py-1" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="panel-c-font-family" class="text-right">Font Family</label>
                  <input id="panel-c-font-family" type="text" v-model="panelCSettings.fontFamily" class="col-span-3 rounded-md border border-gray-300 px-2 py-1" />
                </div>
                <div class="grid grid-cols-4 items-center gap-4">
                  <label htmlFor="panel-c-font-size" class="text-right">Font Size</label>
                  <input id="panel-c-font-size" type="text" v-model="panelCSettings.fontSize" class="col-span-3 rounded-md border border-gray-300 px-2 py-1" />
                </div>
              </div>
            </WallModal>
            Panel C
          </SplitterPanel>
        </SplitterGroup>
      </SplitterPanel>
    </SplitterGroup>
  </div>
</template>