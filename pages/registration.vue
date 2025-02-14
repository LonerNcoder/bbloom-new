<!-- pages/register.vue -->
<template>
    <div class="min-h-screen flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
      <div class="max-w-md w-full">
        <!-- Header -->
        <div class="text-center mb-8">
          <h1 class="text-3xl font-bold text-gray-900">Create Account</h1>
          <p class="mt-2 text-sm text-gray-600">Enter your details to get started</p>
        </div>
  
        <!-- Registration Form -->
        <div class="bg-white py-8 px-6 shadow rounded-lg">
          <form @submit.prevent="handleRegister" class="space-y-6">
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
                  maxlength="30"
                  @input="checkUsername"
                  class="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm 
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-blue-500"
                  :class="{ 
                    'border-red-500': errors.username,
                    'border-green-500': isUsernameAvailable && username.length > 0
                  }"
                />
                <!-- Username Validation Feedback -->
                <div class="mt-1 text-sm">
                  <p v-if="errors.username" class="text-red-600">
                    {{ errors.username }}
                  </p>
                  <p v-else-if="isCheckingUsername" class="text-gray-600">
                    Checking username availability...
                  </p>
                  <p v-else-if="isUsernameAvailable && username.length > 0" class="text-green-600">
                    Username is available
                  </p>
                  <p class="text-gray-500 mt-1">
                    {{ 30 - username.length }} characters remaining
                  </p>
                </div>
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
                  class="appearance-none block w-full px-3 py-2 border rounded-md shadow-sm 
                         placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-blue-500"
                  :class="{ 'border-red-500': errors.password }"
                />
                <button 
                  type="button"
                  @click="showPassword = !showPassword"
                  class="absolute inset-y-0 right-0 pr-3 flex items-center"
                >
                  <Eye v-if="showPassword" class="h-5 w-5 text-gray-400" />
                  <EyeOff v-else class="h-5 w-5 text-gray-400" />

                </button>
                <p v-if="errors.password" class="mt-1 text-sm text-red-600">
                  {{ errors.password }}
                </p>  
              </div>
            </div>
  
            <!-- Create Account Button -->
            <div>
              <button
                type="submit"
                :disabled="isLoading || !isUsernameAvailable || isCheckingUsername"
                class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm 
                       text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none 
                       focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 
                       disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Loader
                  v-if="isLoading"
                  class="animate-spin -ml-1 mr-2 h-4 w-4"
                />
                {{ isLoading ? 'Creating Account...' : 'Create Account' }}
              </button>
            </div>
  
            <!-- Login Link -->
            <div class="text-center">
              <NuxtLink 
                to="/login"
                class="text-sm text-blue-600 hover:text-blue-500"
              >
                Already have an account? Sign in
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
  import { Icon } from 'lucide-vue-next';
  import { Eye } from 'lucide-vue-next';
  import { EyeOff } from 'lucide-vue-next';
  import { Loader } from 'lucide-vue-next';
  import debounce from 'lodash/debounce'
  definePageMeta({
    layout: 'login',
  })
  const API = useRuntimeConfig().public.baseSafeAPI
  const router = useRouter()
  const username = ref('')
  const password = ref('')
  const showPassword = ref(false)
  const isLoading = ref(false)
  const isCheckingUsername = ref(false)
  const isUsernameAvailable = ref(false)
  
  const errors = reactive({
    username: '',
    password: ''
  })
  
  // Debounced username availability check
  const checkUsername = debounce(async () => {
    const value = username.value.trim()
    
    // Reset states
    errors.username = ''
    isUsernameAvailable.value = false
    
    // Basic validation
    if (!value) return
    if (value.length > 30) {
      errors.username = 'Username must not exceed 30 characters'
      return
    }
    if (!/^[a-zA-Z0-9_]+$/.test(value)) {
      errors.username = 'Username can only contain letters, numbers, and underscores'
      return
    }
  
    try {
      isCheckingUsername.value = true
      
      // API call to check username availability
      const response = await fetch(`${API}check-username?username=${value}`)
      const data = await response.json()
      
      isUsernameAvailable.value = data.available
      if (!data.available) {
        errors.username = 'Username is already taken'
      }
    } catch (error) {
      console.error('Error checking username:', error)
      errors.username = 'Error checking username availability'
    } finally {
      isCheckingUsername.value = false
    }
  }, 500)
  
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
  
  const handleRegister = async () => {
    if (!validateForm()) return
    
    try {
      isLoading.value = true
      
      // API call to create account
      const response = await fetch(`${API}register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: username.value,
          password: password.value
        })
      })
  
      if (!response.statusCode === 200) {
        throw new Error(response.statusMessage)
      }
      router.push('/login')
    } catch (error) {
      console.error('Registration error:', error)
      alert('Failed to create account. Please try again.')
    } finally {
      isLoading.value = false
    }
  }
  </script>