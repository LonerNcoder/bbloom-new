<template>
    <div ref="container" class="novels-container">
      <div ref="row" class="novels-row">
        <slot></slot>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted } from "vue";
      const container = ref(null);
      const row = ref(null);
      let lastHoveredItem = null; // To prevent rapid re-scrolling
  
      const scrollToItem = (event) => {
        const containerElement = container.value;
  
        if (containerElement) {
          lastHoveredItem = event.target;
  
          const containerLeft = containerElement.getBoundingClientRect().left;
          const itemLeft = event.target.getBoundingClientRect().left;
  
          // Scroll to center the item with some padding
          containerElement.scrollBy({
            left: itemLeft - containerLeft - containerElement.offsetWidth / 2 + event.target.offsetWidth / 2,
            behavior: "smooth",
          });
  

        }
      };
  
      onMounted(() => {
        const rowElement = row.value;
        if (rowElement) {
          const slotItems = rowElement.children;
          Array.from(slotItems).forEach((item) => {
            // Add hover and click event listeners
            item.addEventListener("focus", scrollToItem);
            item.addEventListener("click", scrollToItem);
          });
        }
      });

  </script>
  
  <style scoped>
  .novels-container {
  width: var(--novels-container-width);
  height: var(--novels-container-height);
  overflow-x: var(--novels-container-overflow-x);
  overflow-y: var(--novels-container-overflow-y);
  white-space: var(--novels-container-white-space);
  padding: var(--novels-container-padding);
  scrollbar-width: var(--novels-container-scrollbar-width);
  -ms-overflow-style: var(--novels-container-ms-overflow-style);
  padding-right: var(--novels-container-padding-right);
}

.novels-container::-webkit-scrollbar {
  display: none; /* Hide scrollbar for WebKit browsers */
}

.novels-row {
  display: var(--novels-row-display);
  gap: var(--novels-row-gap);
  min-width: var(--novels-row-min-width);
  align-items: var(--novels-row-align-items);
}

.novels-row > *:hover {
  outline: var(--novels-row-hover-outline);
  cursor: var(--novels-row-hover-cursor);
}

.novels-row > *:active {
  outline: var(--novels-row-active-outline);
}
  </style>
  