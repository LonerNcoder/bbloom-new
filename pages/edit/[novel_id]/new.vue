<!-- edit.[novel][chapter_id].vue -->
<template>
    <div>
        <ClientOnly>
          <DmsEditor :novel_id="novel_id" :title="title" content="" :isNew=true mode="draft" ></DmsEditor>
        </ClientOnly>
         <!-- <ExtendEditor></ExtendEditor> -->
    </div>

  </template>
  
  <script setup>


  import DmsEditor from '~/components/DmsEditor.vue';
  // import ExtendEditor from '~/components/ExtendEditor.vue';


  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router';
  definePageMeta({
    layout: false,
    components: {
      DmsEditor
      // :() => import("~/componentsLazy/DmsEditor.vue")
    }
  })

  const route = useRoute();
  const novel_id = parseInt(route.params.novel_id);
  const title = ref(`untitled_${Math.floor(Date.now() % 100000000)}`)
  </script>
  
  <style>
  .prose {
    max-width: none;
  }
  </style>