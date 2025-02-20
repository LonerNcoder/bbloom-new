<template>
  <div
    class="relative w-full h-screen bg-gradient-to-br from-blue-500 to-purple-600 overflow-hidden"
    @mousemove="handleMouseMove"
    @click="handleClick"
  >
    <!-- Animated Books -->
    <div
      v-for="book in books"
      :key="book.id"
      class="absolute transition-all duration-300 ease-out"
      :style="getAdjustedStyle(book)"
    >
      <component
        :is="ICONS[book.iconType]"
        :size="book.size"
        class="text-white opacity-30"
      />
    </div>

    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
        <div class="bg-white/10 backdrop-blur-lg rounded-lg p-8 w-80 shadow-lg">
          <h2 class="text-2xl font-bold text-white mb-6 text-center">Welcome Back</h2>
          
          <div class="space-y-4">
            <div class="relative">
              <User class="absolute left-3 top-3 text-white/50 " size="16" />
              <input
                type="text"
                placeholder="Username"
                v-model="username"
                class="w-full pl-10 pr-4 py-2 bg-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            
            <div class="relative">
              <Lock class="absolute left-3 top-3 text-white/50" size="16" />
              <input
                type="password"
                placeholder="Password"
                v-model="password"
                class="w-full pl-10 pr-4 py-2 bg-white/20 rounded-lg text-white placeholder-white/70 focus:outline-none focus:ring-2 focus:ring-white/50"
              />
            </div>
            
            <button class="w-full py-2 bg-white text-purple-600 rounded-lg font-semibold hover:bg-white/90 transition-colors"
            @click="handleLogin"
            >
              Login
            </button>
            
            <p class="text-center text-white text-sm">
              New here?
              <NuxtLink to="/register" class="font-semibold hover:underline">
                Register now
              </NuxtLink>
            </p>
          </div>
        </div>
      </div>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, onUnmounted } from 'vue';
import {
  BookOpen,
  BookHeart,
  Star,
  Facebook,
  Cookie,
  User,
  Lock
} from 'lucide-vue-next'; // Adjust the import based on your setup

// Create an array of icon components
const ICONS = [BookOpen, BookHeart, Star, Facebook, Cookie];

// Generate random books with initial positions and properties
function generateRandomBooks(count) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    baseX: Math.random() * 100,
    baseY: Math.random() * 100,
    rotation: Math.random() * 360,
    size: 16 + Math.random() * 16,
    speed: 0.5 + Math.random() * 0.5,
    iconType: Math.floor(Math.random() * ICONS.length)
  }));
}

// Reactive state
const books = ref(generateRandomBooks(15));
const mousePos = reactive({ x: 0, y: 0 });
const clickWave = reactive({ active: false, x: 0, y: 0, time: 0 });

let intervalId;

// Update books on an interval
onMounted(() => {
  intervalId = setInterval(() => {
    const now = Date.now();
    books.value = books.value.map((book) => {
      const newX = book.baseX + Math.sin(now * 0.001 * book.speed) * 2;
      const newY = book.baseY + Math.cos(now * 0.001 * book.speed) * 2;
      let waveX = newX;
      let waveY = newY;
      if (clickWave.active) {
        const dx = book.x - clickWave.x;
        const dy = book.y - clickWave.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxWaveDistance = 50;
        const waveSpeed = 0.003;
        const waveTime = clickWave.time * waveSpeed;
        const wavePhase = distance / 10 - waveTime;
        const waveAmplitude = Math.max(
          0,
          Math.min(1, (maxWaveDistance - distance) / maxWaveDistance)
        );
        const waveFactor =
          Math.sin(wavePhase) * Math.exp(-wavePhase * 0.5) * waveAmplitude * 15;
        const angle = Math.atan2(dy, dx);
        waveX = newX + Math.cos(angle) * waveFactor;
        waveY = newY + Math.sin(angle) * waveFactor;
      }
      return {
        ...book,
        x: waveX,
        y: waveY,
        rotation: book.rotation + book.speed
      };
    });
    if (clickWave.active) {
      clickWave.time += 1;
      if (clickWave.time >= 100) {
        clickWave.active = false;
      }
    }
  }, 16);
});

// Clean up the interval when the component is unmounted
onUnmounted(() => {
  clearInterval(intervalId);
});

// Handle mouse move: update mouse position relative to the container (in percentages)
function handleMouseMove(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  mousePos.x = ((e.clientX - rect.left) / rect.width) * 100;
  mousePos.y = ((e.clientY - rect.top) / rect.height) * 100;
}

// Handle click: trigger the click wave effect at the click position
function handleClick(e) {
  const rect = e.currentTarget.getBoundingClientRect();
  clickWave.x = ((e.clientX - rect.left) / rect.width) * 100;
  clickWave.y = ((e.clientY - rect.top) / rect.height) * 100;
  clickWave.active = true;
  clickWave.time = 0;
}

// Compute adjusted style for a book element, adding a repulsion effect from the mouse
function getAdjustedStyle(book) {
  const dx = book.x - mousePos.x;
  const dy = book.y - mousePos.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  const repulsion = Math.max(0, 1 - distance / 20) * 3;
  const angle = Math.atan2(dy, dx);
  const adjustedX = book.x + Math.cos(angle) * repulsion;
  const adjustedY = book.y + Math.sin(angle) * repulsion;
  return {
    left: `${adjustedX}%`,
    top: `${adjustedY}%`,
    transform: `rotate(${book.rotation}deg)`
  };
}

const { $store } = useNuxtApp()
const API = useRuntimeConfig().public.baseSafeAPI
const userStore = useUserStore()
const router = useRouter()

// Define reactive state
const username = ref('')
const password = ref('')
const showPassword = ref(false)
const isLoading = ref(false)
const errors = reactive({
  username: '',
  password: ''
})
const errorMessage = ref('')

// Form validation function
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

// Login handler triggered when clicking the login button
const handleLogin = async () => {
  if (!validateForm()) return

  try {
    isLoading.value = true
    errorMessage.value = ''

    const payload = {
      username: username.value,
      password: password.value
    }
    const response = await $fetch(`${API}login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    })

    if (response.statusCode === 200) {
      const data = response.body
      const userData = {
        id: data.user.id,
        username: data.user.username,
        image: data.user.image || "default_profile.jpg",
        sessionToken: data.sessionToken,
        accessToken: data.accessToken,
        apiKey: data.apiKey,
        loggedIn: true
      }
      userStore.setUserData(userData)
      await $store.setUserData(userData)
      router.push('/')
    } else {
      errorMessage.value = response.statusText
    }
  } catch (error) {
    console.error('Login failed:', error)
    errorMessage.value = 'An error occurred during login.'
  } finally {
    isLoading.value = false
  }
}
</script>
