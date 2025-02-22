<template>
    <div class="mb-10  bg-[--section-bg-color] p-4 rounded-lg">
        <div class="mb-4">
            <h2 class="text-2xl font-bold text-gray-900 dark:text-white mb-1">{{ title }}</h2>
            <p class="text-sm text-gray-500 dark:text-gray-400">{{ subtitle }}</p>
        </div>
        <div class="grid grid-cols-2 md:grid-cols-4 gap-6">
            <NovelAlbumCard
                v-for="item in items"
                :key="item"
                :id="item.id"
                :title="item.title"
                :author="item.author"
                :image="item.coverImage"
                :percentage="item.percentage"
            />
        </div>
    </div>
</template>
<script setup>
defineProps({
    title: String,
    subtitle: String,
    items: Array
})
</script>
