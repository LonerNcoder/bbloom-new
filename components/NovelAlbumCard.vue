
<template>
        <div class="flex flex-col" :style="cardStyle">
          <div class="relative overflow-hidden rounded-md mb-2" :style="imageStyle">
            <img 
              :src="image" 
              :alt="title" 
              class="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
            />
          </div>
          <h3 class="text-sm font-medium text-gray-900 dark:text-white truncate">{{ title }}</h3>
          <p class="text-xs text-gray-500 dark:text-gray-400 truncate">{{ author }}</p>
        </div>
</template>
<script setup>

const props = defineProps({
    title: String,
    author: String,
    image: String,
    percentage: {
        type: Number,
        default: 100
    }
})

const safePercentage = computed(() => {
    return Math.min(100, Math.max(50, props.percentage));
})

const cardStyle = computed(() => {
    return {
        width: `${safePercentage.value}%`,
        margin: '0 auto'
    };
})

const imageStyle = computed(() => {
    return {
        aspectRatio: `${0.85 + (safePercentage.value / 100) * 0.15}/1`
    };
})
</script>
