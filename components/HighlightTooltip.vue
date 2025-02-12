<!-- HighlightTooltip.vue -->
<template>
    <div class="highlight-tooltip" :style="tooltipStyle">
      <div class="color-options">
        <button v-for="color in colors" :key="color" 
                :style="{ backgroundColor: color }"
                @click="apply(color)">
        </button>
      </div>
      <button class="remove-btn" @click="remove">
        Remove
      </button>
    </div>
  </template>
  
  <script setup lang="ts">
  import { computed, defineProps, defineEmits } from 'vue';
  
  const props = defineProps({
    x: { type: Number, required: true },
    y: { type: Number, required: true },
  });
  const emit = defineEmits(['apply-highlight', 'remove-highlight']);
  const remove = () =>{
    console.log("remove")
    emit("remove-highlight")
  }
  const apply = (c: string)=>{
    console.log("apply")
    emit('apply-highlight', c)
  }
  const colors = ['yellow', 'pink', 'lightblue']; // define your palette
  
  const tooltipStyle = computed(() => ({
    position: 'absolute' as const,
    left: `${props.x}px`,
    top: `${props.y}px`,
    zIndex: 1000,
    // add your tooltip styling here (background, border, etc.)
  }));
  </script>
  
  <style scoped>
  .highlight-tooltip {
    /* style your tooltip container */
    padding: 8px;
    border: 1px solid #ccc;
    background: white;
    border-radius: 4px;
    display: flex;
    gap: 8px;
  }
  .color-options button {
    width: 24px;
    height: 24px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
  }
  .remove-btn {
    background: transparent;
    border: none;
    cursor: pointer;
    color: red;
  }
  </style>
  