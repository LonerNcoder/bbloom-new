import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    id: "",
    username: "anon",
    image: "",
    sessionToken: "",
    accessToken: "",
    apiKey: "",
    loggedIn: false
  }),
  getters: {
    // Returns the entire user data
    getUserData: (state) => state,
    // Returns each property individually
    getId: (state) => state.id,
    getUsername: (state) => state.username,
    getImage: (state) => state.image,
    getSessionToken: (state) => state.sessionToken,
    getAccessToken: (state) => state.accessToken,
    getApiKey: (state) => state.apiKey,
    isLoggedIn: (state) => state.loggedIn
  },
  actions: {
    // Set the entire user data at once
    setUserData(userData) {
      this.id = userData.id
      this.username = userData.username
      this.image = userData.image
      this.sessionToken = userData.sessionToken
      this.accessToken = userData.accessToken
      this.apiKey = userData.apiKey
      this.loggedIn = userData.loggedIn
    },
    // Setters for individual properties
    setId(id) {
      this.id = id
    },
    setUsername(username) {
      this.username = username
    },
    setImage(image) {
      this.image = image
    },
    setSessionToken(token) {
      this.sessionToken = token
    },
    setAccessToken(token) {
      this.accessToken = token
    },
    setApiKey(key) {
      this.apiKey = key
    },
    setLoggedIn(status) {
      this.loggedIn = status
    },
    logout() {
      this.id = ""
      this.username = "anon"
      this.image = ""
      this.sessionToken = ""
      this.accessToken = ""
      this.apiKey = ""
      this.loggedIn = false
    }
  },
  persist: {
    storage: piniaPluginPersistedstate.localStorage(),
  }
})
