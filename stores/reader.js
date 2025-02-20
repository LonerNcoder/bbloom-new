import { defineStore } from 'pinia'

export const useReaderStore = defineStore('reader', {
  state: () => ({
    backgroundColor: 'var(--chapter-body-bg-color)',
    fontSize: 16,
    brightness: 100,
    gestureEnabled: false,
    isButtonVisible: true,
    fontColor: 'var(--chapter-body-text-color)',
    mobile_pos_floatingButtonPosition: {x: 0, y: 0},
    floatingButtonPosition: {x: 0, y: 0},
  }),
  getters: {
    getFloatingButtonPosition: (state) => (key) => state[key],
  },
  actions: {
    async setBackgroundColor(color) {
      this.backgroundColor = color
    },
    async setFontSize(size) {
      this.fontSize = size
    },
    async setBrightness(brightness) {
      this.brightness = brightness
    },
    async setGestureEnabled(value) {
      this.gestureEnabled = value;
    },
    async setIsButtonVisible(visible) {
      this.isButtonVisible = visible;
    },
    async setFontColor(color) {
      this.fontColor = color;
    },
    async setMobilePosFloatingButtonPosition(position) {
      this.mobile_pos_floatingButtonPosition = position
    },
    async setFloatingButtonPosition(position) {
      this.floatingButtonPosition = position
    },
    async setFloatingButtonPosition(key,position){
        this[key] = position
    }
  },
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
    key: 'reader',
    
  }
})


