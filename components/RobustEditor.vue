<!-- edit.[novel][chapter_id].vue -->
<template>
  <LoadingAnimation v-if="loading"></LoadingAnimation>
    <!-- <client-only fallback-tag="div" fallback="Loading editor..."> -->
    <div class="min-h-screen flex flex-col bg-gray-50">
      <!-- Top Navigation Bar -->
      <nav class="bg-white border-b px-4 py-2 flex items-center justify-between">
        <div class="flex items-center space-x-2">
          <h1 class="text-xl font-bold">{{chapterTitle || "no title"}}</h1>

          <NuxtLink :to="`/edit/${novel_id}`" class="inline-flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100 rounded-md">
            <ArrowBigLeft name="lucide:save" class="w-4 h-4" />
            Back
          </NuxtLink>
             <!-- Save Button with Dropdown -->
             <div class="relative inline-block">
              <button 
                @click="toggleSaveMenu"
                class="inline-flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100 rounded-md"
                ref="saveButtonRef"
              >
                <Save name="lucide:save" class="w-4 h-4" />
                Save
              </button>
              
              <!-- Save Options Dropdown -->
              <transition
                enter-active-class="transition ease-out duration-100"
                enter-from-class="transform opacity-0 scale-95"
                enter-to-class="transform opacity-100 scale-100"
                leave-active-class="transition ease-in duration-75"
                leave-from-class="transform opacity-100 scale-100"
                leave-to-class="transform opacity-0 scale-95"
              >
                <div v-show="showSaveMenu" 
                    class="absolute z-50 mt-1 bg-white rounded-md shadow-lg border border-gray-200 py-1 w-40"
                    ref="dropdownRef">
                  <button 
                    @click="saveAsDraft"
                    class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Save as Draft
                  </button>
                  <button 
                    @click="saveAsUnpublished"
                    class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100"
                  >
                    Save as Unpublished
                  </button>
                </div>
              </transition>
            </div>

          <!-- Publish Now Button -->
          <button 
            @click="publishNow"
            class="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white hover:bg-green-700 rounded-md"
          >
            <Upload class="w-4 h-4" />
            {{ mode === "pub" ? "Update Chapter": "Publish Now" }}
          </button>
          <button class="inline-flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100 rounded-md">
            <Settings class="w-4 h-4"  ></Settings>
            Settings
          </button>
        </div>
        <div class="flex items-center space-x-2">
          <button class="px-3 py-1.5 text-sm border border-gray-300 hover:bg-gray-100 rounded-md">Share</button>
          <button class="px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md">{{username}}</button>
        </div>
      </nav>
  
      <div class="flex-1 flex">
        <!-- Main Writing Area -->
        <div :class="`flex-1 transition-all duration-300 ${showUtilityPanel ? 'w-2/3' : 'w-full'}`">
          <div class="h-full flex flex-col">
            <!-- Chapter Navigation -->
            <!-- Writing Space max-w-3xl -->
            <div class="flex-1 p-8 bg-white mx-auto w-full overflow-y-auto" >
              <div class="max-w-none">
                <input
                  v-model="chapterTitle"
                  type="text"
                  placeholder="Chapter Title"
                  class="w-full text-3xl font-bold mb-4 p-2 border-none focus:outline-none focus:ring-2 focus:ring-blue-200 rounded-md"
                />

                <!-- <client-only > -->
                     <!-- <ExtendEditor nuxt-client></ExtendEditor> -->
                <!-- </client-only> -->

                <div>
                  <div style="border-bottom: 1px solid #e8e8e8;">
                    <div id="editor-toolbar"></div>
                  </div>
                  <div id="content">
                    <div id="editor-container">
                      <!-- <div id="title-container">
                        <input v-model="pageTitle" placeholder="Page title..." />
                      </div> -->
                      <div id="editor-text-area"></div>
                    </div>
                  </div>
                </div>
                <div id="mask"></div>
 
                <button @click="getEditorHtml" class="responsive-button">Save</button>
              </div>
            </div>
          </div>
        </div>

        <!-- Floating Chapter Button -->
        <button
          @click="showChapterPanel = !showChapterPanel"
          class="fixed right-4 bottom-4 z-50 bg-blue-600 text-white rounded-full p-3 shadow-lg hover:bg-blue-700"
        >
          <MenuSquare class="w-6 h-6" />
        </button>

        <!-- Chapter Panel -->
        <div
          v-if="showChapterPanel"
          class="fixed right-4 bottom-20 z-50 w-72 bg-white rounded-lg shadow-xl border"
        >
          <div class="p-4">
            <div class="flex items-center justify-between mb-4">
              <h3 class="font-semibold">Chapters</h3>
              <div class="relative">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search..."
                  class="pl-8 pr-2 py-1 text-sm border rounded-md w-40"
                />
                <Search class="w-4 h-4 text-gray-400 absolute left-2 top-1.5" />
              </div>
            </div>
            
            <div class="max-h-96 overflow-y-auto">
              <div 
                v-for="chapter in filteredChapters" 
                :key="chapter.id"
                :class="[
                  'p-2 rounded-md cursor-pointer hover:bg-gray-100',
                  currentChapter === chapter.id ? 'bg-blue-50 text-blue-600' : ''
                ]"
                @click="selectChapter(chapter.id)"
              >
                {{ chapter.title }}
              </div>
              <div 
                class="p-2 rounded-md cursor-pointer hover:bg-gray-100 text-blue-600"
                @click="createNewChapter"
              >
                + New Chapter
              </div>
            </div>
          </div>
        </div>
  
        <!-- Utility Sidebar Toggle -->
        <button
          @click="toggleUtilityPanel"
          class="bg-gray-100 hover:bg-gray-200 px-1 flex items-center"
        >
          {{ showUtilityPanel ? '→' : '←' }}
        </button>
  
        <!-- Utility Sidebar -->
        <div v-if="showUtilityPanel" class="w-1/3 bg-white border-l">
          <div class="flex border-b">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              :class="[
                'flex items-center px-4 py-2 hover:bg-gray-50',
                activeTab === tab.value ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
              ]"
              @click="activeTab = tab.value"
            >
              <component :is="tab.icon" class="w-4 h-4 mr-2" > </component>
              {{ tab.label }}
            </button>
          </div>
  
          <!-- Characters Tab -->
          <div v-if="activeTab === 'characters'" class="p-4">
            <div class="bg-white rounded-lg shadow">
              <div class="p-4">
                <h3 class="font-semibold mb-2">Characters in Scene</h3>
                <div class="space-y-2">
                  <div v-for="character in characters" :key="character.id" 
                       class="flex items-center justify-between p-2 bg-gray-50 rounded-md">
                    <span>{{ character.name }}</span>
                    <button 
                      class="px-3 py-1.5 text-sm hover:bg-gray-100 rounded-md"
                      @click="viewCharacterDetails(character)"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Plot Tab -->
          <div v-if="activeTab === 'plot'" class="p-4">
            <div class="bg-white rounded-lg shadow">
              <div class="p-4">
                <h3 class="font-semibold mb-2">Plot Structure</h3>
                <div class="bg-blue-50 text-blue-700 rounded-md p-4">
                  <span>Current chapter: {{ plotStructure.currentPhase }}</span>
                </div>
              </div>
            </div>
          </div>
  
          <!-- Analysis Tab -->
          <div v-if="activeTab === 'analysis'" class="p-4">
            <div class="bg-white rounded-lg shadow">
              <div class="p-4 space-y-4">
                <div class="flex items-center gap-2" :class="analysisResults.grammar ? 'text-green-600' : 'text-red-600'">
                  <Check :name="analysisResults.grammar ? 'lucide:check' : 'lucide:x'" class="w-4 h-4" />
                  Grammar check {{ analysisResults.grammar ? 'passed' : 'failed' }}
                </div>
                <div class="flex items-center gap-2" :class="analysisResults.plothole ? 'text-yellow-600' : 'text-green-600'">
                  <TriangleAlert :name="analysisResults.plothole ? 'lucide:alert-triangle' : 'lucide:check'" class="w-4 h-4" />
                  {{ analysisResults.plothole ? 'Potential plothole detected' : 'No plotholes detected' }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- </client-only> -->
  </template>
  
  <script setup>

  // import ExtendEditor from '~/components/ExtendEditor.vue';

  // import {UmoEditor} from '@umoteam/editor';
  import '@wangeditor/editor/dist/css/style.css' // import css

  import { i18nChangeLanguage, createEditor, createToolbar } from '@wangeditor/editor'
  // import { isLoggedIn, getUsername, getHeaders } from '~/utils/utils';
  import { ref, reactive, onMounted , defineProps, watch, defineEmits } from 'vue'
  import { useRoute } from 'vue-router';
  import {Settings, Save, ArrowBigLeft, GitBranchIcon } from 'lucide-vue-next'
  import { TriangleAlert, MenuSquare } from 'lucide-vue-next';
  import { Upload, Search, Check, Users } from 'lucide-vue-next';

  const loading = ref(true)

  definePageMeta({
    components: {
      // ExtendEditor
      // : () => import('~/componentsLazy/ExtendEditor.vue')
    }
  })


  const props = defineProps({
        content:{
          type: String,
          default: "",
        },
        title:{
          type: String,
          required: true
        },
        novel_id:{
          type: Number,
          required: true

        },
        id:{
          type: Number
        },
        mode:{
          type: String,
          default: "draft",
        },
        isNew: {
          type: Boolean,
          default: true,
        }
    })

  const {$store} = useNuxtApp()
  const headers = ref({})

  const isMounted = ref(false);
  const ueditor = ref();
  var editor;
  const emit = defineEmits(['save']);

  const route = useRoute();
  const novel_id = parseInt(route.params.novel_id);

  //user state
  const dbName = 'client-db';
  const storeName = 'account-settings';
  const username = ref("anon"); // Make username reactive
  const userLoggedIn = ref(false);
  
  // State
  const showUtilityPanel = ref(false)
  const activeTab = ref('characters')
  const chapterTitle = ref('')
  const chapterContent = ref('')
  const currentChapter = ref(1)
  const quillEditor = ref(null)
   // Generate title with random number based on current timestamp

  // Add new state for save menu
  const showSaveMenu = ref(false)
const saveButtonRef = ref(null)
const dropdownRef = ref(null)

const toggleSaveMenu = () => {
  showSaveMenu.value = !showSaveMenu.value
}

// Handle clicks outside the dropdown
const handleClickOutside = (event) => {
  if (
    saveButtonRef.value && 
    dropdownRef.value && 
    !saveButtonRef.value.contains(event.target) && 
    !dropdownRef.value.contains(event.target)
  ) {
    showSaveMenu.value = false
  }
}

const load_editor = async () => {
    isMounted.value = true;
    // Change language
    i18nChangeLanguage('en')

    const editorConfig = {
      placeholder: 'Type here...',
      scroll: false, // 禁止编辑器滚动
      MENU_CONF: {
        uploadImage: {
          onBeforeUpload: (file) => {
            console.log(file)

            return file // will upload this file
            // return false // prevent upload
          },
          onProgress(progress) {
            console.log('onProgress', progress)
          },
          onSuccess(file, res) {
            console.log('onSuccess', file, res)
          },
          onFailed(file, res) {
            alert(res.message)
            console.log('onFailed', file, res)
          },
          onError(file, err, res) {
            alert(err.message)
            console.error('onError', file, err, res)
          },

          customUpload: async(file, insertFn) => {
            console.log(file)
            let url = "https://www.google.com/imgres?q=image&imgurl=https%3A%2F%2Fcdn3.pixelcut.app%2F7%2F20%2Funcrop_hero_bdf08a8ca6.jpg&imgrefurl=https%3A%2F%2Fwww.pixelcut.ai%2Funcrop&docid=bMeRnUMlv5wA4M&tbnid=2rcODYf4hp3U3M&vet=12ahUKEwijlf6j7OyKAxVxcGwGHWtSK1gQM3oECH4QAA..i&w=800&h=800&hcb=2&ved=2ahUKEwijlf6j7OyKAxVxcGwGHWtSK1gQM3oECH4QAA"
            let alt = 'yoho.jpg'
            let href = "https://www.google.com/imgres?q=image&imgurl=https%3A%2F%2Fcdn3.pixelcut.app%2F7%2F20%2Funcrop_hero_bdf08a8ca6.jpg&imgrefurl=https%3A%2F%2Fwww.pixelcut.ai%2Funcrop&docid=bMeRnUMlv5wA4M&tbnid=2rcODYf4hp3U3M&vet=12ahUKEwijlf6j7OyKAxVxcGwGHWtSK1gQM3oECH4QAA..i&w=800&h=800&hcb=2&ved=2ahUKEwijlf6j7OyKAxVxcGwGHWtSK1gQM3oECH4QAA"
            insertFn(url, alt, href)
          },

        }
      },
      // onChange(editor) {
      //   console.log(editor.getHtml())
      // },

    }

    // Create editor
    editor = createEditor({
      selector: '#editor-text-area',
      content: [],
      config: editorConfig
    })

    // Create toolbar
    const toolbar = createToolbar({
      editor,
      selector: '#editor-toolbar',
      config: {
        excludeKeys: 'fullScreen',
      }
    })

    // Focus editor on click
    document.getElementById('editor-text-area').addEventListener('click', e => {
      if (e.target.id === 'editor-text-area') {
        editor.blur()
        editor.focus(true) // focus to the end
      }
    })
   
    // editor.setHtml(props.content)
    await editor.setHtml(props.content)

    editor.on('modalOrPanelShow', modalOrPanel => {
      if (modalOrPanel.type !== 'modal') return

      const { $elem } = modalOrPanel // modal element
      const width = $elem.width()
      const height = $elem.height()

      // set modal position z-index
      $elem.css({
        left: '50%',
        top: '50%',
        marginLeft: `-${width / 2}px`,
        marginTop: `-${height / 2}px`,
        zIndex: 1000
      })

      // show mask div
      document.getElementById('mask').style.display = 'block'
    })
    editor.on('modalOrPanelHide', () => {
      console.log('hide')

      // hide mask div
      document.getElementById('mask').style.display = 'none'
    })
    // click mask div to hide modal
    document.getElementById('mask').addEventListener('click', () => {
      editor.hidePanelOrModal()
    })

}
const destroy_editor = () => {
    // Destroy editor instance if necessary
    if (editor) {
    editor.destroy()
  }
}

const onChangedPageSize = () => {
  console.log("test")
  // console.log(pageSize, oldPageSize)
  return
}

const autoPagination = () =>{
  editor.value.autoPagination(false)
  console.log(editor.value.getEditor())
}

// Add new methods

const saveAsDraft = async () => {
  //    editor.setHtml(props.content)
  const content = editor.getHtml()
  var resp = null;

  if(props.isNew){
    resp = await saveModeNew("draft",content);
  }else if(!props.isNew && props.mode !== "draft"){
    resp = await migrateMode("draft",props.mode,content)
  }else{
    resp = await updateDetails("draft",content)
  }

  
  if(resp.statusCode === 200){
    alert("content saved as draft successfully")
    clear_editor()
  }else{
    alert(resp.message)
  }
  showSaveMenu.value = false
}
const clear_editor = () => {
  editor.setHtml("");
  chapterTitle.value = "";
  return
}

const saveAsUnpublished = async () => {
  const content = editor.getHtml()
  var resp;
  if(props.isNew){
    resp = await saveModeNew("unpub",content);
  }else if(!props.isNew && props.mode !== "unpub"){
    resp = await migrateMode("unpub", props.mode,content)
  }else{
    resp = await updateDetails("unpub",content)
  }

  if(resp.statusCode === 200){
    alert("content saved as unpublished chapter successfully")
    clear_editor()
  }else{
    alert(resp.message)
  }
  showSaveMenu.value = false
}

const publishNow = async() => {
  const content = editor.getHtml()
  var resp;
  if(props.isNew){
    resp = await saveModeNew("pub",content)
    console.log(resp)
  }else if(!props.isNew && props.mode !== "pub"){
    resp = await migrateMode("pub", props.mode,content)
  }else{
    resp = await updateDetails("pub",content)
  }

  if(resp.statusCode === 200){
      alert("Published the chapter successfully")
      clear_editor()
    }else{
      alert(resp.message)
    }
}

const migrateMode = async(to,from,content) =>{
  return await $fetch(`${API}novels/${props.novel_id}/chapters/migrate?to=${to}&from=${from}`,
      {
        method: "PUT",
        headers: headers.value,
        body: JSON.stringify({
          id: props.id,
          title : chapterTitle.value,
          content: content
        })
      }
  )
}

const saveModeNew = async(mode,content) => {
  return await $fetch(`${API}novels/${props.novel_id}/chapters/edit/new?query=${mode}`,
      {
        method: "POST",
        headers: headers.value,
        body: JSON.stringify({
          title : chapterTitle.value,
          content: content
        })
      }
    )
}

const updateDetails = async(mode,content) => {
  return await $fetch(`${API}novels/${props.novel_id}/chapters/edit/${props.id}?query=${mode}`,
    {
      method: "PUT",
      headers: headers.value,
      body: JSON.stringify({
        title : chapterTitle.value,
        content: content
      })
    }
  )
}

// Add click outside handler to close drop
 
  // Sample data

  const chapters = reactive([])
  
  const characters = reactive([
    { id: 1, name: 'John Smith' },
    { id: 2, name: 'Sarah Johnson' }
  ])
  
  const tabs = reactive([
    { value: 'characters', label: 'Characters', icon: Users },
    { value: 'plot', label: 'Plot', icon: GitBranchIcon },
    { value: 'analysis', label: 'Analysis', icon: TriangleAlert }
  ])
  
  const plotStructure = reactive({
    currentPhase: 'Rising Action'
  })
  
  const analysisResults = reactive({
    grammar: true,
    plothole: false
  })


  onMounted(async () => {
            username.value = await $store.getUsername();
            userLoggedIn.value = await $store.isLoggedIn();
            headers.value = await $store.getNormalHeaders();

            await load_editor();
            // console.log(props)
            chapterTitle.value = props.title
            // const data = await $fetch(`${API}novels/${route.params.novel_id}/chapters/edit/new`)

            document.addEventListener('click', handleClickOutside)

            // if(!props.isNew){
            //   const data = await $fetch(`${API}novels/${props.novel_id}/chapters/edit/${props.id}?query=${props.mode}`)
            //   chapterTitle = data.body.title
            //   editor.setHtml(data.body.content)
            // }

          // editor.setHTML(props.content)

          loading.value = false;
  });
  onBeforeMount(async ()=>{
    await destroy_editor();
    document.removeEventListener('click', handleClickOutside)
  })
    
  // watch(() => props.content, (newContent) => {
	// 	if(editor.value){
	// 		editor.value.setContent(newContent)
	// 	}
  // });
  
  // Methods
  function appendStyleToHTML(htmlString) {
    // Check if there is a <head> tag in the HTML string
    if (htmlString.includes('<head>')) {
        // Insert the <style> tag after the opening <head> tag
        return htmlString.replace('<head>', `<head><link rel="stylesheet" href="~/assets/css/quill.snow.css">`);
    } else {
        // If no <head> tag, append the <style> tag at the beginning of the body or the HTML string
        return `<link rel="stylesheet" href="~/assets/css/quill.snow.css">${htmlString}`;
    }
  }


  const getEditorHtml = () => {
    if (quillEditor.value) {
        const quill = quillEditor.value.getQuill()
        const htmlContent = quillEditor.value.getHTML(); // Get HTML content
        console.log(htmlContent)
        const inlinedHtml = appendStyleToHTML(htmlContent); // Apply styles
        const blob = new Blob([htmlContent], { type: 'text/html' }); // Create a Blob
        const url = URL.createObjectURL(blob); // Create a URL for the Blob

        // // Create an <a> element to trigger download
        const a = document.createElement('a');
        a.href = url;
        a.download = 'editor-content.html'; // File name
        document.body.appendChild(a); // Append to body
        a.click(); // Trigger click
        document.body.removeChild(a); // Remove from body
        URL.revokeObjectURL(url); // Revoke the object URL
      }
  }
  const toggleUtilityPanel = () => {
    showUtilityPanel.value = !showUtilityPanel.value
  }
  
  const analyzeContent = () => {
    // Implement content analysis logic here
    console.log('Analyzing content...')
  }
  
  const previousChapter = () => {
    if (currentChapter.value > 1) {
      currentChapter.value--
    }
  }
  
  const nextChapter = () => {
    if (currentChapter.value < chapters.length) {
      currentChapter.value++
    }
  }
  
  const viewCharacterDetails = (character) => {
    console.log('Viewing character:', character.name)
  }


  // Add new reactive variables for chapter panel
const showChapterPanel = ref(false)
const searchQuery = ref('')

// Computed property for filtered chapters
const filteredChapters = computed(() => {
  if (!searchQuery.value) return chapters
  const query = searchQuery.value.toLowerCase()
  return chapters.filter(chapter => 
    chapter.title.toLowerCase().includes(query)
  )
})

// Modified chapter selection method
const selectChapter = (chapterId) => {
  currentChapter.value = chapterId
  showChapterPanel.value = false // Close panel after selection
}

// New chapter creation method
const createNewChapter = () => {
  const newChapter = {
    id: chapters.length + 1,
    title: `Chapter ${chapters.length + 1}: Untitled`
  }
  chapters.push(newChapter)
  selectChapter(newChapter.id)
}
  </script>
  
<style scoped>
  .prose {
    max-width: none;
  }
</style>