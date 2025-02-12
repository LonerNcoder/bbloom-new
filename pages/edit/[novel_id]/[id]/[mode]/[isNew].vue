
  
  <script setup>


  // import RobustEditor from '~/components/RobustEditor.vue';
  import DmsEditor from '~/components/DmsEditor.vue';
  import LoadingAnimation from '~/components/LoadingAnimation.vue';

  //ADD cache support from localforage

  import { ref, onMounted } from 'vue'
  import { useRoute } from 'vue-router';
  const {$store} = useNuxtApp();
  const webMode = ref(await $store.getWebMode())
      var API;
      const config = useRuntimeConfig().public
      if(webMode.value === "Safe"){
        API = config.baseSafeAPI
      }else if(webMode.value === "Pirate"){
        API = config.basePriateAPI
      }else{
        API = config.baseSafeAPI
      }
  const route = useRoute();
  const loading = ref(true);
  const params = route.params;

  const title = ref("untitled");
  const content = ref("")
  const mode = params.mode; // Get mode from query or default to 'edit'
  const isNew = (params.isNew === 'true'); // Get isNew from query and convert to boolean

  definePageMeta({
    layout: false,
    components: {
      // RobustEditor,
      DmsEditor
    },
  })
  const novel_id = parseInt(params.novel_id);
  const id = parseInt(params.id);
  const stop_loading = () => {
    loading.value = false
  }

  onMounted(async () => {
    if(!isNew){
        var contentObj = await $store.getChapterById(novel_id,id,mode);
        if(contentObj && contentObj.title && contentObj.content){
          title.value = contentObj.title;
          content.value = contentObj.content;
        }else{
          const headers = await $store.getNormalHeaders();
          const resp = await $fetch(`${API}novels/${novel_id}/chapters/${id}?mode=${mode}`,{
            headers: headers
          })
          console.log(resp)
          if (resp.statusCode == 200){
            title.value = resp.body.title
            content.value = resp.body.content
          }else{
            alert(resp.message)
            route.push(`/novel/${novel_id}`)
          }
        }

    }
    stop_loading()
  })
  </script>

  <!-- edit.[novel][chapter_id].vue -->
<template>
    <LoadingAnimation v-if="loading"></LoadingAnimation>
    <div v-else>
        <ClientOnly>
          <DmsEditor :novel_id="novel_id" :id="id" :title="title" :content="content" :isNew="isNew" :mode="mode" ></DmsEditor>
        </ClientOnly>
         <!-- <ExtendEditor></ExtendEditor> -->
    </div>

  </template>
  
  <style>
  .prose {
    max-width: none;
  }
  </style>