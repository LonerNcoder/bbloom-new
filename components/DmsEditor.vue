<template>
  <div :class="['min-h-screen flex flex-col', isDarkMode ? 'bg-gray-900 text-white' : 'bg-gray-50 text-black']">
    <!-- Top Navigation Bar -->
    <nav class="bg-white dark:bg-gray-800 border-b px-4 py-2 flex items-center justify-between">
      <div class="flex items-center space-x-2">
        <NuxtLink :to="`/edit/${novel_id}`" class="inline-flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md">
          <ArrowBigLeft name="lucide:save" class="w-4 h-4" />
          Back
        </NuxtLink>

        <!-- Save Button with Dropdown -->
        <div class="relative inline-block">
          <button 
            @click="toggleSaveMenu"
            class="inline-flex items-center gap-2 px-3 py-1.5 text-sm hover:bg-gray-100 dark:hover:bg-gray-700 rounded-md"
            ref="saveButtonRef"
          >
            <Save name="lucide:save" class="w-4 h-4" />
            Save
          </button>
          <transition
            enter-active-class="transition ease-out duration-100"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-75"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div v-show="showSaveMenu" 
                 class="absolute z-50 mt-1 bg-white dark:bg-gray-700 rounded-md shadow-lg border border-gray-200 dark:border-gray-600 py-1 w-40"
                 ref="dropdownRef">
              <button 
                @click="saveAsDraft"
                class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Save as Draft
              </button>
              <button 
                @click="saveAsUnpublished"
                class="w-full text-left px-4 py-2 text-sm hover:bg-gray-100 dark:hover:bg-gray-600"
              >
                Save as Unpublished
              </button>
            </div>
          </transition>
        </div>

        <!-- Publish Now Button -->
        <UTooltip :text="mode === 'pub' ? 'Update Chapter' : 'Publish Now'">
          <button 
            @click="publishNow"
            class="inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-green-600 text-white hover:bg-green-700 rounded-md"
          >
            <Upload class="w-4 h-4" />
          </button>
        </UTooltip>
      </div>
      <div class="flex items-center space-x-2">
        <!-- Dark Mode Toggle Button -->
        <button @click="toggleDarkMode" class="px-3 py-1.5 rounded-md bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 text-sm">
          {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
        </button>
        <AvatarRoot>
          <AvatarImage :src="imageSrc" />
          <AvatarFallback>{{ username.charAt(0) }}</AvatarFallback>
        </AvatarRoot>
      </div>
    </nav>

    <!-- Shortcut Modal -->
    <ShortcutModal class="z-[10000]"
      :groups="groups" 
      :posX="shortCutModalX" 
      :posY="shortCutModalY"
      :visible="shortCutKeyPressed"
      :search="searchTerm"
      @result="handleSelect"
      @close="closeModal"
    ></ShortcutModal>
  
    <div class="flex-1 flex">
      <!-- Main Writing Area -->
      <div class="flex-1 transition-all duration-300 w-full">
        <div class="h-full flex flex-col">
          <!-- Writing Space -->
          <div class="flex-1 p-8 bg-white dark:bg-gray-800 mx-auto w-full overflow-y-auto">
            <div class="max-w-none">
              <input
                v-model="chapterTitle"
                type="text"
                placeholder="Chapter Title"
                class="w-full text-3xl font-bold mb-4 p-2 border-none focus:outline-none focus:ring-2 focus:ring-blue-200 dark:focus:ring-blue-600 rounded-md"
              />

              <!-- TinyMCE Editor -->
              <textarea id="txttinyeditor"></textarea>
              <div id="mask"></div>
 
              <button @click="getEditorHtml" class="responsive-button mt-6 px-3 py-1.5 text-sm bg-green-600 text-white hover:bg-green-700 rounded-md">
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Floating Action Buttons -->
      <WriterTools class="z-[11]" @toggleChapterPanel="toggleChapterPanel" @toggleAI="toggleAI" />

      <!-- Chapter Panel -->
      <div v-show="showChapterPanel" class="fixed right-4 bottom-20 z-50 w-72 bg-white dark:bg-gray-800 rounded-lg shadow-xl border dark:border-gray-600">
        <div class="p-4">
          <div class="flex flex-col items-center justify-between mb-4">
            <div class="panel-btn-container flex flex-row mb-4 gap-4">
              <button class="panel-btn-class" @click="fetchChapters('pub')">pub</button>
              <button class="panel-btn-class" @click="fetchChapters('unpub')">unpub</button>
              <button class="panel-btn-class" @click="fetchChapters('draft')">draft</button>
            </div>
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
      <div class="utility-panel-wrapper">
        <button
          @click="toggleUtilityPanel"
          class="fixed bg-blue-600 z-[11] right-2 h-16 top-[48%] text-white rounded-md flex items-center"
        >
          {{ showUtilityPanel ? '→' : '←' }}
        </button>
  
        <!-- Utility Sidebar -->
        <div v-show="showUtilityPanel" class="utility-sidebar bg-white dark:bg-gray-800 border-l dark:border-gray-700">
          <div class="flex justify-around border-b dark:border-gray-600">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              :class="[
                'flex items-center px-4 py-2 hover:bg-gray-50 dark:hover:bg-gray-700',
                activeTab === tab.value ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-600'
              ]"
              @click="activeTab = tab.value"
            >
              <component :is="tab.icon" class="w-4 h-4 mr-2"></component>
              {{ tab.label }}
            </button>
          </div>
  
          <!-- Entities Tab -->
          <div v-show="activeTab === 'entities'" class="p-4">
            <KeepAlive>
              <EntityPanel 
                :groups="groups" 
                :shortCutKeyPressed="shortCutKeyPressed" 
                :shortCutKey="shortCutKey" 
                @result="handleShortCutResult"
                @update-group="handleGroupUpdate"
              ></EntityPanel>
            </KeepAlive>
          </div>
  
          <!-- Plot Tab -->
          <div v-show="activeTab === 'plot'" class="p-4">
            <PlotStructure :editor="activeEditor" />
          </div>
  
          <!-- Analysis Tab -->
          <div v-if="activeTab === 'analysis'" class="p-4">
            <div class="bg-white dark:bg-gray-800 rounded-lg shadow">
              <div class="p-4 space-y-4">
                <button 
                  @click="checkGrammar"
                  :disabled="grammarChecking"
                  class="mb-4 inline-flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-600 text-white hover:bg-blue-700 rounded-md"
                >
                  <template v-if="!grammarChecking">
                    <Check class="w-4 h-4" />
                    Check Grammar
                  </template>
                  <template v-else>
                    Loading...
                  </template>
                </button>
  
                <div v-if="analysisResults.check">
                  <div class="flex items-center gap-2" :class="analysisResults.check === 'PASSED' ? 'text-green-600' : 'text-red-600'">
                    <Check v-if="analysisResults.grammar" name="lucide:check" class="w-4 h-4" />
                    <X v-else name="lucide:x" class="w-4 h-4" />
                    Grammar check {{ analysisResults.check === 'PASSED' ? 'passed' : 'failed' }}
                  </div>
                </div>
  
                <div v-if="analysisResults.errors" class="text-red-600 text-sm p-3 bg-red-50 rounded-md">
                  <span v-for="error in analysisResults.errors" :key="error">{{ error }}</span><br/>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ModernChatBotStylish v-if="showAI" :context="chapterContent" @close="toggleAI"></ModernChatBotStylish>
  </div>
</template>
 
<script setup>

// Import Radix Vue primitives (the actual import names may vary based on your setup)
import {
  NavigationMenuRoot,
  NavigationMenuItem,
  DropdownMenuRoot,
  DropdownMenuTrigger,
  DropdownMenuPortal,
  DropdownMenuContent,
  DropdownMenuItem,
  TooltipRoot,
  TooltipTrigger,
  TooltipContent,
  DialogRoot,
  DialogTrigger,
  DialogPortal,
  DialogOverlay,
  DialogContent,
  TabsRoot,
  TabsList,
  TabsTrigger,
  TabsContent,
  AvatarRoot,
  AvatarImage,
  AvatarFallback
} from 'radix-vue'

import {
  ArrowLeftIcon,
  SaveIcon,
  UploadIcon,
  UsersIcon,
  AlertTriangleIcon,
  BookIcon,
  EyeOffIcon,
  CheckIcon,
  SearchIcon,
  PanelRightOpenIcon,
} from 'lucide-vue-next'

import { ref, reactive, onMounted , defineProps, watch, defineEmits } from 'vue'
import { useRoute } from 'vue-router';
import {Settings, Save, ArrowBigLeft, GitBranchIcon, BotMessageSquare, PlusIcon, Upload, Search, Check, Users, TriangleAlert, MenuSquare } from 'lucide-vue-next'

  
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
          },
})
 const shortCutKey = ref("")
 const loading = ref(true)
 const activeEditor = ref(null)
 const removeStyles = async (htmlString) => {
 // Parse HTML string
 const parser = new DOMParser();
 const doc = parser.parseFromString(htmlString, "text/html");
 // Get the body element
 const bodyElement = doc.body;
 // Extract the background color directly
 const bgColor = bodyElement.style.backgroundColor || "#ffffff";
 localStorage.setItem("editorBgColor", bgColor); // Save to localStorage
 // Function to clean styles
 function cleanStyles(element) {
      if (element.hasAttribute("style")) {
        let style = element.getAttribute("style");
  
        // Remove unwanted styles (but NOT background color)
        style = style.replace(
          /\b(margin|padding|width|height|min-width|min-height|max-width|max-height|margin-left|margin-right|margin-top|margin-bottom|padding-left|padding-right|padding-top|padding-bottom|position)\s*:\s*[^;]+;?/gi,
          ""
        ).trim();
  
        // Update the style attribute
        if (style === "") {
          element.removeAttribute("style");
        } else {
          element.setAttribute("style", style);
        }
      }
    }
  
    // Clean styles for the body
    cleanStyles(bodyElement);
    // Return cleaned HTML
    return bodyElement.outerHTML;
};
useHead({
    title: "dms editor",
    script:[ 
      {
        src: 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/5.10.9/tinymce.min.js',
        defer: true,
        async: true,
        onload: () => {
          tinymce.init({
          selector: '#txttinyeditor',
          plugins: "advlist anchor autolink autosave charmap code codesample directionality emoticons fullpage fullscreen help image imagetools insertdatetime link lists media nonbreaking noneditable pagebreak paste preview print quickbars save searchreplace spellchecker tabfocus table template textpattern toc visualblocks visualchars wordcount",
          toolbar: 'undo redo | formatselect fontselect fontsizeselect | bold italic underline | forecolor backcolor customformatpainter | formats |  link image media | alignleft aligncenter alignright alignjustify | lineheight checklist bullist numlist | preview fullscreen | indent outdent | floatleft floatright',
          toolbar_mode: 'floating',
          toolbar_sticky: true,
          quickbars_insert_toolbar: 'quicktable align image media codesample',
          quickbars_selection_toolbar: 'bold italic underline | align fontsizeselect | bullist numlist | blockquote quicklink',
          contextmenu: 'bold italic underline | align fontsizeselect ',
          // icons: 'thin',
          menubar: true,
          image_advtab: true,
          fontsize_formats: "8pt 10pt 11pt 12pt 14pt 16pt 18pt 20pt 22pt 24pt 36pt",
          branding: false,
          height: '700px',
          content_css: "document",
          content_style: `
              ${isDarkMode.value ? 'body {background: #1a1a1a;}' : 'body {background: #fff;}'}
              ${isDarkMode.value ? 'html {background: #1a1a1a;}' : 'html {background: #eceef4;}'}
                html {
                  min-height: 100%;
                  padding: 0.5rem;
                }

        /* Disable the blue "focus" border for the editable region */
        .editable-section:focus-visible {
          outline: none !important;
        }

        .header,
        .footer {
          font-size: 0.8rem;
          color: #ddd;
        }

        .header {
          display: flex;
          justify-content: space-between;
          padding: 0 0 1rem 0;
        }

        .header .right-text {
          text-align: right;
        }

        .footer {
          padding:2rem 0 0 0;
          text-align: center;
        }

        /* Apply page-like styling */
            @media screen and (max-width: 600px) {
                body {
                    background-color: #fff;
                    box-shadow: 0 0 4px rgba(0,0,0,.15);
                    box-sizing: border-box;
                    margin: 1rem auto 0;
                    max-width: 100%; /* Adjust for small screens */
                    min-height: calc(100vh - 1rem);
                    padding: 1rem 1rem; /* Reduce padding for small screens */
                }
            }
          `,
          remove_script_host: false,
          relative_urls: false,
          setup: async function (editor) {

            var onAction = function (autocompleteApi, rng, value) {
              editor.selection.setRng(rng);
              editor.insertContent(value);
              autocompleteApi.hide();
            };

            editor.ui.registry.addAutocompleter('specialchars_cardmenuitems', {
      ch: '-',
      minChars: 1,
      columns: 1,
      highlightOn: ['char_name'],
      onAction: onAction,
      fetch: function (pattern) {
        return new tinymce.util.Promise(function (resolve) {
      // Use the getFilteredGroups function to filter groupsData by the current pattern.
      var filtered = getFilteredGroups(pattern, groups.value);

      // Flatten the results by mapping each matched child to a cardmenuitem.
      var results = [];
      filtered.forEach(function (group) {
        group.matchedChildren.forEach(function (child) {
          results.push({
            type: 'cardmenuitem',
            // You can choose what to use as the value – here we use the child name;
            // alternatively, you might use child.id or some other property.
            value: child.name,
            label: child.name,
            items: [
              {
                type: 'cardcontainer',
                direction: 'vertical',
                items: [
                  {
                    type: 'cardtext',
                    text: child.name,
                    name: 'child_name',
                    attributes: {
                      style: 'font-weight: bold; color: #333;'
                    }
                  },
                  // {
                  //   type: 'cardtext',
                  //   text: group.title,
                  //   attributes: {
                  //     style: 'font-weight: 100; color: grey;'
                  //   }
                  // }
                ]
              }
            ]
          });
        });
      });
      resolve(results);
    });
  }
});
                let selectedColor = '#ffffff';
                editor.on('init', async function () {
                  const cleanedHtml = await removeStyles(props.content)

                  editor.setContent(cleanedHtml)

                  const savedBgColor = localStorage.getItem("editorBgColor") || "#ffffff"; 

                  editor.getBody().style.backgroundColor = savedBgColor;
                  document.getElementsByClassName("paint-icon-rect")[0].setAttribute("fill",savedBgColor)
                  activeEditor.value = editor;
                });
                // editor.on('keydown', (e) =>{
                //   handleKeyPress(e)
                // });
                editor.ui.registry.addIcon("paint-icon",
                  `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-paint-roller"><rect class="paint-icon-rect" fill="${selectedColor}" width="16" height="6" x="2" y="2" rx="2"/><path d="M10 16v-2a2 2 0 0 1 2-2h8a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect width="4" height="6" x="8" y="16" rx="1"/></svg>`
                ),

                  // Add custom format painter button
                editor.ui.registry.addButton('customformatpainter', {
                  // icon: 'format-painter',
                  icon: "paint-icon",
                  onAction: function () {
                    const body = editor.getBody();
                    const currentColor = body.style.backgroundColor || '#ffffff';

                    // api.setData({ color: currentColor });
  
          
                    editor.windowManager.open({
                      title: 'Background Color',
                      body: {
                        type: 'panel',
                        items: [{
                          type: 'colorinput',
                          name: 'color',
                          label: 'Color',
                          value: currentColor,
                        }],
                      },
                      initialData: { color: currentColor },
                      buttons: [
                        { type: 'cancel', text: 'Cancel' },
                        { type: 'submit', text: 'Apply', primary: true }
                      ],
                      onSubmit:async (api) => {
                        const color = api.getData().color;
                        selectedColor = color;

                        localStorage.setItem("editorBgColor",color)
                        
                        // Apply to body tag
                        editor.dom.setStyles(editor.getBody(), {
                          'background-color': color
                        });
                        editor.getBody().setAttribute("style",`background-color:${color}`)

                        document.getElementsByClassName("paint-icon-rect")[0].setAttribute("fill",color)

                        editor.setContent(getEditorContentWithBg(editor))
                        api.close();
                      }
                    });
                  }
                });
          },
        })
    }}
  ]
})
const isDarkMode = ref(false)
const {$store} = useNuxtApp()
const headers = ref({})
const isMounted = ref(false);
const emit = defineEmits(['save']);
const route = useRoute();
const novel_id = parseInt(route.params.novel_id);
//user state
const dbName = 'client-db';
const storeName = 'account-settings';
const username = ref("anon"); // Make username reactive
const userLoggedIn = ref(false);
const imageSrc = ref("")
const showAI = ref(false)
// State
const showUtilityPanel = ref(false)
const activeTab = ref('entities')
const chapterTitle = ref('')
const chapterContent = ref('')
const currentChapter = ref(1)
const quillEditor = ref(null)
 // Generate title with random number based on current timestamp
// Add new state for save menu
const showSaveMenu = ref(false)
const saveButtonRef = ref(null)
const dropdownRef = ref(null)
const chapters = ref([])
const entities = reactive([
    { id: 1, name: 'John Smith' },
    { id: 2, name: 'Sarah Johnson' }
  ])
  
const tabs = reactive([
    { value: 'entities', label: 'Entities', icon: Users },
    { value: 'plot', label: 'Plot', icon: GitBranchIcon },
    { value: 'analysis', label: 'Analysis', icon: TriangleAlert }
  ])
  
const plotStructure = reactive({
    currentPhase: 'Rising Action'
  })
  
// const analysisResults = reactive({
//     grammar: true,
//     plothole: false
//   })
const showChapterPanel = ref(false)
const searchQuery = ref('')

//shortcut functionality
const groups = ref([])
const searchTerm = ref('a')
const shortCutKeyPressed = ref(false)
const shortCutModalX = ref(0)
const shortCutModalY = ref(0)
const currentEditorCursor = ref(null)
const user = ref(null)
var atSymbolCount = 0
var lastKeyWasAt = false
var lastAtTime = 0
const API = useRuntimeConfig().public.baseSafeAPI
// Define your match priorities
const MatchPriority = {
  EXACT_SHORTCUT: 4,
  SHORTCUT_WITH_INDEX: 3,
  CHILD_MATCH: 2,
  PARTIAL_MATCH: 1
};

//utility panel
const grammarChecking = ref(false)
const analysisResults = reactive({
  grammar: null,
  check: null,
  plothole: false,
  errors: null
})

//METHODS
const toggleSaveMenu = () => {
  showSaveMenu.value = !showSaveMenu.value
}

const toggleChapterPanel = async ()=>{
  showChapterPanel.value = !showChapterPanel.value
  showChapterPanel.value?await fetchChapters("pub"):[]
  return
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

const destroy_editor = () => {
    // Destroy editor instance if necessary
    if (activeEditor.value) {
    activeEditor.value.destroy()
  }
}

function getEditorContentWithBg(editor) {
  const content = editor.getContent(); // Get TinyMCE content
  const bgColor = localStorage.getItem("editorBgColor") || "#ffffff"; // Retrieve saved background color

  // Parse content using DOMParser
  const parser = new DOMParser();
  const doc = parser.parseFromString(content, "text/html");

  // Apply background color directly to <body>
  if (doc.body) {
    doc.body.style.backgroundColor = bgColor;
  }

  // Return modified HTML as a string
  return doc.documentElement.outerHTML;
}
const saveAsDraft = async () => {
  const content = getEditorContentWithBg(activeEditor.value);
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
  activeEditor.value.setContent("");
  chapterTitle.value = "";
  return
}

const saveAsUnpublished = async () => {
  const content = getEditorContentWithBg(activeEditor.value)
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
  const content = getEditorContentWithBg(activeEditor.value)
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
const fetchChapters = async (type) => {
  const data = await $fetch(`${API}novels/${novel_id}`,{
    headers: headers.value,
    params:{
      limit:5,
      order:"desc",
      sort: "chapterNumber",
      type:type
    }
  })


  chapters.value = data.body.chapters
  console.log(chapters.value)
  return
}

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
        const htmlContent = quillEditor.value.getContent(); // Get HTML content
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
    if (currentChapter.value < chapters.value.length) {
      currentChapter.value++
    }
  }
  
const viewCharacterDetails = (character) => {
    console.log('Viewing character:', character.name)
  }

// Computed property for filtered chapters
const filteredChapters = computed(() => {
  if (!searchQuery.value) return chapters.value
  const query = searchQuery.value.toLowerCase()
  return chapters.value.filter(chapter => 
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
    id: chapters.value.length + 1,
    title: `Chapter ${chapters.value.length + 1}: Untitled`
  }
  chapters.value.push(newChapter)
  selectChapter(newChapter.id)
}

const handleShortCutResult = (res) =>{
  console.log(res)
}

const handleSelect = (res) => {
  shortCutKeyPressed.value = false
  activeEditor.value.selection.moveToBookmark(currentEditorCursor.value)
  activeEditor.value.focus()
  activeEditor.value.execCommand('mceInsertContent', false, `${res.name} `)
}

const handleGroupUpdate = async (newGroup) =>{
  await $store.setGroups(newGroup)
  groups.value = newGroup
}

// Add these methods
const getCursorPosition = (editor) => {
  const selection = editor.selection
  currentEditorCursor.value = selection.getBookmark()
  const range = selection.getRng()
  const element = range.startContainer.parentElement
  const editorPosition = editor.getContainer().getBoundingClientRect()
  const cursorPosition = element.getBoundingClientRect()

  return {
    x: cursorPosition.left - editorPosition.left,
    y: cursorPosition.bottom - editorPosition.top
  }
}

const resetShortcutState = () => {
  searchTerm.value = ''
  shortCutKeyPressed.value = false
  atSymbolCount = 0
  lastKeyWasAt = false
}

const closeModal = () => {
  shortCutKeyPressed.value = false
  resetShortcutState()
}

const handleKeyPress = (event) => {
  // Handle @ symbol
  if (event.key === '@') {
    const currentTime = Date.now()
    
    if (lastKeyWasAt && currentTime - lastAtTime < 500) {
      atSymbolCount++
      if (atSymbolCount === 2) {
        resetShortcutState()
        return
      }
    } else {
      atSymbolCount = 1
      lastKeyWasAt = true
      lastAtTime = currentTime

      const pos = getCursorPosition(activeEditor.value)
      shortCutModalX.value = pos.x
      shortCutModalY.value = pos.y
      shortCutKeyPressed.value = true
      
      event.preventDefault()
      return
    }
  } else {
    lastKeyWasAt = false
  }

  // Handle input while shortcut is active
  if (shortCutKeyPressed.value) {
    if (event.key === 'Escape') {
      closeModal()
      return
    }

    if (event.key === 'Backspace') {
      if (searchTerm.value.length === 0) {
        closeModal()
      } else {
        searchTerm.value = searchTerm.value.slice(0, -1)
      }
      event.preventDefault()
      return
    }

    if (
      event.key.length === 1 && 
      !event.ctrlKey && 
      !event.altKey && 
      !event.metaKey
    ) {
      searchTerm.value += event.key
      event.preventDefault()
    }
  }
}

function getFilteredGroups(searchTerm, groupsData) {
  searchTerm = searchTerm.toLowerCase().trim();
  if (!searchTerm) {
    // Return groups with no matches if search term is empty
    return groupsData.map(group => ({
      ...group,
      expanded: false,
      matchedChildren: [],
      matchPriority: 0
    }));
  }
  console.log(groupsData)

  return groupsData
    .map(group => {
      const result = { ...group, matchedChildren: [], expanded: false, matchPriority: 0 };

      // If the user types a hyphen followed by more than 2 characters (e.g. "-cha")
      // and no explicit shortcut was provided, match against the group title.
      if (searchTerm.startsWith('-') && searchTerm.length > 2) {
        const query = searchTerm.slice(1); // Remove the leading hyphen.
        if (group.title.toLowerCase().includes(query)) {
          result.matchPriority = MatchPriority.PARTIAL_MATCH;
          result.expanded = true;
          result.matchedChildren = [...group.children];
          return result;
        }
      }

      // Exact shortcut match
      if (group.shortcut.toLowerCase() === searchTerm) {
        result.matchPriority = MatchPriority.EXACT_SHORTCUT;
        result.expanded = true;
        result.matchedChildren = [...group.children];
        return result;
      }

      // Shortcut with index match: allow an optional hyphen between the shortcut and a 1–5 digit number.
      const regex = new RegExp(`^${group.shortcut.toLowerCase()}-?(\\d{1,5})$`, 'i');
      const shortcutMatch = searchTerm.match(regex);
      if (shortcutMatch) {
        const indexNum = parseInt(shortcutMatch[1], 10);
        const childIndex = indexNum - 1; // convert to zero-based index
        result.matchPriority = MatchPriority.SHORTCUT_WITH_INDEX;
        result.expanded = true;
        if (childIndex >= 0 && childIndex < group.children.length) {
          result.matchedChildren = [group.children[childIndex]];
        } else {
          // Out-of-range: use the last child of the group.
          result.matchedChildren = [group.children[group.children.length - 1]];
        }
        return result;
      }

      // Child name match
      const childMatches = group.children.filter(child =>
        child.name.toLowerCase().includes(searchTerm)
      );
      if (childMatches.length) {
        result.matchPriority = MatchPriority.CHILD_MATCH;
        result.expanded = true;
        result.matchedChildren = childMatches;
        return result;
      }

      // Partial title or shortcut match (fallback)
      if (
        group.title.toLowerCase().includes(searchTerm) ||
        group.shortcut.toLowerCase().includes(searchTerm)
      ) {
        result.matchPriority = MatchPriority.PARTIAL_MATCH;
        result.expanded = true;
        result.matchedChildren = [...group.children];
        return result;
      }

      return result;
    })
    // Only return groups with a high enough match priority.
    .filter(group => group.matchPriority > 1)
    .sort((a, b) => (b.matchPriority || 0) - (a.matchPriority || 0));
}


const checkGrammar = async () => {
  try {
    grammarChecking.value = true
    analysisResults.errors = null
    
    const textContent = activeEditor.value.getContent({ format: 'text' })
    
    const response = await $fetch(`${API}checker/grammar`, {
      method: 'POST',
      headers: headers.value,
      body: JSON.stringify({ text: textContent })
    })

    analysisResults.grammar = true

    analysisResults.check = response.check
    if (response) {
      console.log(response)
      analysisResults.errors = response.errors
    }
  } catch (error) {
    console.error('Grammar check failed:', error)
    analysisResults.grammar = false
    analysisResults.errors = 'Failed to perform grammar check. Please try again.'
  } finally {
    grammarChecking.value = false
  }
}

const toggleAI = () =>{
  if(!showAI.value){
    chapterContent.value = activeEditor.value.getContent({ format: 'text' })
    showAI.value = true
  }else{
    showAI.value = false
    chapterContent.value = ""
  }
  
}

const isExpanded = ref(false) // Controls mobile FAB expansion

onMounted(async () => {
            user.value = await $store.getUserData()
            imageSrc.value = `${useRuntimeConfig().public.imageUrl}/${user.image}`
            username.value = await $store.getUsername();
            userLoggedIn.value = await $store.isLoggedIn();
            headers.value = await $store.getNormalHeaders();

            // await load_editor();
            // console.log(props)
            chapterTitle.value = props.title
            // const data = await $fetch(`${API}novels/${route.params.novel_id}/chapters/edit/new`)

            document.addEventListener('click', handleClickOutside)
            groups.value = await $store.getGroups()

            await nextTick()
            loading.value = false;
            console.log(activeEditor)
            if (activeEditor.value) {
            //   const handler = createEditorHandler(activeEditor.value)
            //   activeEditor.value.on('keydown', handler)
              console.log(true)
            }
  });
  const toggleDarkMode = () =>   {
      isDarkMode.value = !isDarkMode.value
  };

  /**
 * Updates the TinyMCE editor's content area and UI based on the theme.
 * @param {boolean} dark - True if dark mode is active.
 */
function updateEditorUITheme(dark) {
  const editor = activeEditor.value
  if (!editor) return

  // Update the content area's background and text colors.
  if (editor.getBody()) {
    editor.getBody().style.backgroundColor = dark ? "#1a1a1a" : "#ffffff"
    editor.getBody().style.color = dark ? "#ffffff" : "#000000"
  }

  // Update the TinyMCE UI by toggling a CSS class on the editor's container.
  const container = editor.getContainer()
  if (container) {
    // Query all divs and spans under the container.
    const elements = container.querySelectorAll("div, span")
    elements.forEach(el => {
      if (dark) {
        el.classList.add("tinymce-dark")
      } else {
        el.classList.remove("tinymce-dark")
      }
    })
  }
}

  watch(isDarkMode, (newVal) => {
    updateEditorUITheme(newVal)
  });
  onBeforeMount(async ()=>{
    await destroy_editor();
    document.removeEventListener('click', handleClickOutside)
  })
</script>
<style>
.sidebar-transition {
  transition: width 0.3s ease;
}

.utility-sidebar {
  width: 50%;
  z-index: 10;
  z-index: 10;
    height: 100%;
    position: fixed;
    right: 0;
}

@media (max-width: 600px) {
  .utility-sidebar {
    width: 95%;
  }
}

.panel-btn-class {
  @apply px-3 py-1.5 text-sm hover:bg-gray-100 rounded-md;
}


.tinymce-dark{
  background-color: #1a1a1a !important;
  color: #ffffff !important;
}
.tinymce-dark .tox .tox-toolbar,
.tinymce-dark .tox .tox-menubar,
.tinymce-dark .tox .tox-quickbars {
  background-color: #1a1a1a !important;
}
.tinymce-dark .tox .tox-toolbar button,
.tinymce-dark .tox .tox-menu-item,
.tinymce-dark .tox .tox-button {
  color: #ffffff !important;
}
.tinymce-dark .tox .tox-toolbar button:hover,
.tinymce-dark .tox .tox-menu-item:hover {
  background-color: #333333 !important;
}
</style>
