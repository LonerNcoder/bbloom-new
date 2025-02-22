<template>
    <div class="book-section">
      <h2 class="book-section-title">{{ title }}</h2>
      <p class="book-section-subtitle">{{ subtitle }}</p>
      <div class="book-grid">
        <div v-for="book in books" :key="book.id" class="book-item">
          <div class="book-cover-container">
            <img
              :src="book.cover"
              :alt="book.title"
              class="book-cover"
            />
          </div>
          <h3 class="book-title">{{ book.title }}</h3>
          <p class="book-author">{{ book.author }}</p>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  defineProps({
    title: String,
    subtitle: String,
    books: Array,
  });
  </script>
  
  <style scoped>
  .book-section {
    margin-bottom: 3rem; /* mb-12 from tailwind - 3rem = 48px */
  }
  
  .book-section-title {
    font-size: 1.5rem; /* text-2xl from tailwind - 1.5rem = 24px */
    line-height: 2rem;
    font-weight: 600; /* font-semibold from tailwind */
    margin-bottom: 0.25rem; /* mb-1 from tailwind - 0.25rem = 4px */
  }
  
  .book-section-subtitle {
    color: #6b7280; /* text-gray-600 from tailwind */
    margin-bottom: 1rem; /* mb-4 from tailwind - 1rem = 16px */
  }
  
  .book-grid {
    display: grid;
    grid-template-columns: repeat(1, minmax(0, 1fr)); /* grid-cols-1 from tailwind */
    gap: 1.5rem; /* gap-6 from tailwind - 1.5rem = 24px */
  }
  
  @media (min-width: 768px) { /* md:grid-cols-2 from tailwind - md: = 768px */
    .book-grid {
      grid-template-columns: repeat(2, minmax(0, 1fr));
    }
  }
  
  @media (min-width: 1024px) { /* lg:grid-cols-4 from tailwind - lg: = 1024px */
    .book-grid {
      grid-template-columns: repeat(4, minmax(0, 1fr));
    }
  }
  
  .book-item {
    cursor: pointer; /* cursor-pointer from tailwind */
    --book-item-transition-duration: 200ms; /* duration-200 from tailwind */
  }
  
  .book-item:hover .book-cover {
    transform: scale(1.05); /* group-hover:scale-105 from tailwind */
  }
  
  .book-cover-container {
    position: relative; /* relative from tailwind */
    aspect-ratio: 1/1; /* aspect-square from tailwind */
    overflow: hidden; /* overflow-hidden from tailwind */
    border-radius: 0.5rem; /* rounded-lg from tailwind */
    margin-bottom: 0.75rem; /* mb-3 from tailwind - 0.75rem = 12px */
  }
  
  .book-cover {
    object-fit: cover; /* object-cover from tailwind */
    width: 100%; /* w-full from tailwind */
    height: 100%; /* h-full from tailwind */
    transition-property: transform; /* transition-transform from tailwind */
    transition-duration: var(--book-item-transition-duration);
  }
  
  .book-title {
    font-weight: 500; /* font-medium from tailwind */
    font-size: 0.875rem; /* text-sm from tailwind */
    line-height: 1.25rem;
    margin-bottom: 0; /* Ensure no margin for title */
  }
  
  .book-author {
    color: #6b7280; /* text-gray-600 from tailwind */
    font-size: 0.875rem; /* text-sm from tailwind */
    line-height: 1.25rem;
    margin-top: 0; /* Ensure no margin for author */
  }
  </style>