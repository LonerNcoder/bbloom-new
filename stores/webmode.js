import { defineStore } from 'pinia'

export const useWebModeStore = defineStore('webMode', {
  state: () => ({
    webMode: "Safe"
  }),
  persist: {
    storage: localStorage,
  }
})