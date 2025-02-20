import { defineStore } from 'pinia'

export const useWebModeStore = defineStore('webMode', {
  state: () => ({
    webMode: "safe"
  }),
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
  }
})