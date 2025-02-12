<!-- pages/login.vue -->
<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full">
        <!-- Logo/Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Welcome back</h1>
          <p class="mt-2 text-sm text-gray-600">Please sign in to continue</p>
        </div>
  
        <!-- Login Form -->
        <div class="bg-white py-8 px-6 shadow rounded-lg">
          <form @submit.prevent="handleLogin" class="space-y-6">
            <!-- Username Field -->
            <div>
              <label for="username" class="block text-sm font-medium text-gray-700">
                Username
              </label>
              <div class="mt-1">
                <input
                  id="username"
                  v-model="username"
                  type="text"
                  required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-blue-500"
                  :class="{ 'border-red-500': errors.username }"
                />
                <p v-if="errors.username" class="mt-1 text-sm text-red-600">
                  {{ errors.username }}
                </p>
              </div>
            </div>
  
            <!-- Password Field -->
            <div>
              <label for="password" class="block text-sm font-medium text-gray-700">
                Password
              </label>
              <div class="mt-1 relative">
                <input
                  id="password"
                  v-model="password"
                  :type="showPassword ? 'text' : 'password'"
                  required
                  class="appearance-none block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm 
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-blue-500"
                  :class="{ 'border-red-500': errors.password }"
                />
                <button 
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <Icon
                    :name="showPassword ? 'lucide:eye-off' : 'lucide:eye'"
                    class="h-5 w-5 text-gray-400"
                  />
                </button>
                <p v-if="errors.password" class="mt-1 text-sm text-red-600">
                  {{ errors.password }}
                </p>
                <div v-if="errorMessage" class="mt-1 text-sm text-red-600">{{ errorMessage }}</div>
              </div>
            </div>
  
            <!-- Login Button -->
            <div>
              <button
                type="submit"
                :disabled="isLoading"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm 
                       text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none 
                       focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                       disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Icon
                  v-if="isLoading"
                  name="lucide:loader"
                  class="animate-spin -ml-1 mr-2 h-4 w-4"
                />
                {{ isLoading ? 'Signing in...' : 'Sign in' }}
              </button>
            </div>

            <!-- Registration Link -->
            <div class="text-center">
              <NuxtLink 
                to="/registration"
                class="text-sm text-blue-600 hover:text-blue-500"
              >
                New here? Sign up now
              </NuxtLink>
            </div>
          </form>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, reactive } from 'vue'
  import { useRouter } from 'vue-router'
  import { openDB } from 'idb'
  definePageMeta({
    layout: 'login',
  })

  const { $store } = useNuxtApp();
  
  const dbName = 'client-db';
  const storeName = 'account-settings';
  
  const router = useRouter()
  const username = ref('')
  const password = ref('')
  const showPassword = ref(false)
  const isLoading = ref(false)
  const errors = reactive({
    username: '',
    password: ''
  })
  const errorMessage = ref('')
  
  const validateForm = () => {
    let isValid = true
    errors.username = ''
    errors.password = ''
  
    if (!username.value.trim()) {
      errors.username = 'Username is required'
      isValid = false
    }
  
    if (!password.value.trim()) {
      errors.password = 'Password is required'
      isValid = false
    } else if (password.value.length < 4) {
      errors.password = 'Password must be at least 4 characters'
      isValid = false
    }
  
    return isValid
  }
  
  const handleLogin = async () => {
    if (!validateForm()) return
  
    try {
      isLoading.value = true
      errorMessage.value = ''
  
      const payload = {
        username: username.value,
        password: password.value
      }
      const response = await $fetch('${API}login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      })
      if (response.statusCode === 200) {
        const res = response
        const data = res.body
        const userData = {
          id: data.user.id,
          username: data.user.username,
          image: data.user.image || "default_profile.jpg",
          sessionToken: data.sessionToken,
          accessToken: data.accessToken,
          apiKey: data.apiKey,
          logged_in: true
        }
        // Store user data in IndexedDB

        await $store.setUserData(userData)
        
        // const db = await openDB(dbName, 1, {
        //   upgrade(db) {
        //     if (!db.objectStoreNames.contains(storeName)) {
        //         db.createObjectStore(storeName, { keyPath: 'id' });
        //     }
        //   }
        // })
        //   const tx = db.transaction(storeName, 'readwrite');
        //   const store = tx.objectStore(storeName);
        //   await store.put({id : 'user', value: userData})
        //   await tx.done;
        //   db.close();
      
        router.push('/')
      } else {
        errorMessage.value = response.statusText
      }
    } catch (error) {
      console.error('Login failed:', error)
    } finally {
      isLoading.value = false
    }
  }
  </script>