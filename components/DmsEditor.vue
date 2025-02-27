<script setup>
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

import { ref, reactive, onMounted, defineProps, watch, defineEmits, onBeforeUnmount, nextTick, computed } from 'vue'
import { useRoute } from 'vue-router';
import { Settings, Save, ArrowBigLeft, GitBranchIcon, BotMessageSquare, PlusIcon, Upload, Search, Check, Users, TriangleAlert, MenuSquare, X, PanelRightClose } from 'lucide-vue-next'



const props = defineProps({
  content: {
    type: String,
    default: "",
  },
  title: {
    type: String,
    required: true
  },
  novel_id: {
    type: Number,
    required: true

  },
  id: {
    type: Number
  },
  mode: {
    type: String,
    default: "draft",
  },
  isNew: {
    type: Boolean,
    default: true,
  },
})

// State declarations
const isDarkMode = ref(false)
const activeEditor = ref(null)
const chapterTitle = ref(props.title)
const chapterContent = ref('')
const showSaveMenu = ref(false)
const showChapterPanel = ref(false)
const showUtilityPanel = ref(false)
const showAI = ref(false)
const loading = ref(true)
const imageSrc = ref('')  // Populated in onMounted
const headers = ref({})  // Populated in onMounted
const user = useUserStore() // Using Pinia store
const currentChapter = ref(null)
const searchQuery = ref('')
const chapters = ref([]) // Populated by fetchChapters
const filteredChapters = ref([]) // Updated by computed property
const grammarChecking = ref(false)
const analysisResults = reactive({  // Used for grammar check results
  grammar: null,
  check: null,
  plothole: false, // Not currently used, but kept for consistency.
  errors: null
})

// Shortcut modal
const shortCutKeyPressed = ref(false)
const shortCutModalX = ref(0)
const shortCutModalY = ref(0)
const searchTerm = ref('')
const shortCutKey = ref('') // Not actively used in the provided code, but kept.
const groups = ref([]) // Populated in onMounted

// Tabs for utility panel
const activeTab = ref('entities')
const tabs = [
  { label: 'Entities', value: 'entities', icon: Users },
  { label: 'Plot', value: 'plot', icon: MenuSquare },
  { label: 'Analysis', value: 'analysis', icon: TriangleAlert }
]

// For mobile FAB expansion
const isExpanded = ref(false)

// TinyMCE initialization function
function initializeEditor(preservedContent = '') {
  // Store current editor content if it exists
  let currentContent = ''
  if (activeEditor.value) {
    currentContent = activeEditor.value.getContent()
    // Remove the existing editor instance
    tinymce.remove('#txttinyeditor')
  }

  // Initialize with the current theme
  tinymce.init({
    selector: "#txttinyeditor",
    plugins:
      "advlist anchor autolink autosave charmap code codesample directionality emoticons fullpage fullscreen help image imagetools insertdatetime link lists media nonbreaking noneditable pagebreak paste preview print quickbars save searchreplace spellchecker tabfocus table template textpattern toc visualblocks visualchars wordcount",
    toolbar:
      "undo redo | formatselect fontselect fontsizeselect | bold italic underline | forecolor backcolor customformatpainter | formats | link image media | alignleft aligncenter alignright alignjustify | lineheight checklist bullist numlist | preview fullscreen | indent outdent | floatleft floatright",
    toolbar_mode: "floating",
    toolbar_sticky: true,
    quickbars_insert_toolbar: "quicktable align image media codesample",
    quickbars_selection_toolbar:
      "bold italic underline | align fontsizeselect | bullist numlist | blockquote quicklink",
    contextmenu: "bold italic underline | align fontsizeselect",
    menubar: true,
    image_advtab: true,
    fontsize_formats:
      "8pt 10pt 11pt 12pt 14pt 16pt 18pt 20pt 22pt 24pt 36pt",
    branding: false,
    height: "700px",
    remove_script_host: false,
    relative_urls: false,
    // Use dynamic configuration based on dark mode:
    skin: isDarkMode.value ? "oxide-dark" : "oxide",
    content_css: isDarkMode.value ? "dark" : "default",
    content_style: `
      ${isDarkMode.value ? 'html {background: #161616;}' : 'html {background: #eceef4;}'}
      html { min-height: 100%; padding: 0.5rem; }
      body { 
        ${isDarkMode.value ? 'background-color: #1f2937; color: #e5e7eb;' : 'background-color: #ffffff; color: #111827;'} 
        box-shadow: 0 0 4px ${isDarkMode.value ? 'rgba(0, 0, 0, .3)' : 'rgba(0, 0, 0, .15)'}; 
        box-sizing: border-box; 
        margin: 1rem auto 0; 
        max-width: 820px; 
        min-height: calc(100vh - 1rem); 
        padding: 2rem 6rem 2rem 6rem; 
      }
      /* Disable the blue "focus" border for the editable region */
      .editable-section:focus-visible { outline: none !important; }
      .header, .footer { font-size: 0.8rem; color: ${isDarkMode.value ? '#9ca3af' : '#6b7280'}; }
      .header { display: flex; justify-content: space-between; padding: 0 0 1rem 0; }
      .header .right-text { text-align: right; }
      .footer { padding:2rem 0 0 0; text-align: center; }
      @media (min-width: 840px) {
        html { min-height: 100%; padding: 0.5rem; }
      }
      @media screen and (max-width: 600px) {
        body { padding: 1rem 1rem; }
      }
    `,
    setup: (editor) => {
      editor.on("init", () => {
        // Set content from preserved or current content
        if (preservedContent) {
          editor.setContent(preservedContent)
        } else if (currentContent) {
          editor.setContent(currentContent)
        } else if (props.content) {
          editor.setContent(props.content)
        }

        activeEditor.value = editor
        chapterContent.value = editor.getContent()

        // Set up a change listener to update chapterContent
        editor.on('change', () => {
          chapterContent.value = editor.getContent()
        })

        editor.on('keydown', handleKeyPress)
      });
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
  }
})
}

// Toggle dark mode function
const toggleDarkMode = async () => {
  // Toggle the dark mode state
  isDarkMode.value = !isDarkMode.value

  // Save the editor content
  const content = activeEditor.value ? activeEditor.value.getContent() : ''

  // Save the user's preference to localStorage
  localStorage.setItem('editor-dark-mode', isDarkMode.value.toString())

  // Reinitialize the editor with the new theme
  await nextTick()
  initializeEditor(content)
}

// Function to clean up the editor
const destroy_editor = () => {
  if (tinymce) {
    tinymce.remove('#txttinyeditor')
  }
}

// Function to toggle save menu
const toggleSaveMenu = () => {
  showSaveMenu.value = !showSaveMenu.value
}

// Handle click outside save menu
const handleClickOutside = (event) => {
  const dropdownRef = document.querySelector('.dropdown-ref')
  const saveButtonRef = document.querySelector('.save-button-ref')

  if (showSaveMenu.value && dropdownRef && !dropdownRef.contains(event.target) &&
    saveButtonRef && !saveButtonRef.contains(event.target)) {
    showSaveMenu.value = false
  }
}

const {$store} = useNuxtApp()
const API = useRuntimeConfig().public.baseSafeAPI

const removeStyles = async (htmlString) => {
    // Parse HTML string
    // const parser = new DOMParser();
    // const doc = parser.parseFromString(htmlString, "text/html");
    // // Get the body element
    // const bodyElement = doc.body;

    // // Extract the background color directly
    // const bgColor = bodyElement.style.backgroundColor || "#ffffff";
    // localStorage.setItem("editorBgColor", bgColor); // Save to localStorage

    // // Function to clean styles
    // function cleanStyles(element) {
    //     if (element.hasAttribute("style")) {
    //         let style = element.getAttribute("style");

    //         // Remove unwanted styles (but NOT background color)
    //         style = style.replace(
    //             /\b(margin|padding|width|height|min-width|min-height|max-width|max-height|margin-left|margin-right|margin-top|margin-bottom|padding-left|padding-right|padding-top|padding-bottom|position)\s*:\s*[^;]+;?/gi,
    //             ""
    //         ).trim();
    //         // Update the style attribute
    //         if (style === "") {
    //             element.removeAttribute("style");
    //         } else {
    //             element.setAttribute("style", style);
    //         }
    //     }
    // }

    //  // Clean styles for the body and all child elements
    // cleanStyles(bodyElement);
    // for (let child of bodyElement.querySelectorAll('*')) {
    //     cleanStyles(child);
    // }

    // // Return cleaned HTML
    // return bodyElement.outerHTML;
    return htmlString
};

function getEditorContentWithBg(editor) {
    const content = editor.getContent(); // Get TinyMCE content
    // const bgColor = localStorage.getItem("editorBgColor") || "#ffffff"; // Retrieve saved background color

    // // Parse content using DOMParser
    // const parser = new DOMParser();
    // const doc = parser.parseFromString(content, "text/html");

    // // Apply background color directly to <body>
    // if (doc.body) {
    //     doc.body.style.backgroundColor = bgColor;
    // }

    // Return modified HTML as a string
    // return doc.documentElement.outerHTML;
    console.log(content)
    return content
}

// Save functions
const saveAsDraft = async () => {
    const content = await removeStyles(getEditorContentWithBg(activeEditor.value));
    let resp = null;

    if (props.isNew) {
        resp = await saveModeNew("draft", content);
    } else if (!props.isNew && props.mode !== "draft") {
        resp = await migrateMode("draft", props.mode, content)
    } else {
        resp = await updateDetails("draft", content)
    }

    if (resp.statusCode === 200) {
        alert("content saved as draft successfully")
        clear_editor()
         if (props.isNew) {
            navigateTo(`/edit/${props.novel_id}/chapter/${resp.body.id}?mode=draft`)
         }
    } else {
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
    const content = await removeStyles(getEditorContentWithBg(activeEditor.value));
    let resp;
    if (props.isNew) {
        resp = await saveModeNew("unpub", content);
    } else if (!props.isNew && props.mode !== "unpub") {
        resp = await migrateMode("unpub", props.mode, content)
    } else {
        resp = await updateDetails("unpub", content)
    }

    if (resp.statusCode === 200) {
        alert("content saved as unpublished chapter successfully")
        clear_editor()
        if (props.isNew) {
            navigateTo(`/edit/${props.novel_id}/chapter/${resp.body.id}?mode=unpub`)
        }
    } else {
        alert(resp.message)
    }
    showSaveMenu.value = false
}

const publishNow = async () => {
    const content = await removeStyles(getEditorContentWithBg(activeEditor.value));
    let resp;
    if (props.isNew) {
        resp = await saveModeNew("pub", content)
        console.log(resp)
    } else if (!props.isNew && props.mode !== "pub") {
        resp = await migrateMode("pub", props.mode, content)
    } else {
        resp = await updateDetails("pub", content)
    }

    if (resp.statusCode === 200) {
        alert("Published the chapter successfully")
        clear_editor()
        if (props.isNew) {
            navigateTo(`/edit/${props.novel_id}/chapter/${resp.body.id}?mode=pub`)
        }
    } else {
        alert(resp.message)
    }
}
const migrateMode = async (to, from, content) => {
    return await $fetch(`${API}novels/${props.novel_id}/chapters/migrate?to=${to}&from=${from}`,
        {
            method: "PUT",
            headers: headers.value,
            body: JSON.stringify({
                id: props.id,
                title: chapterTitle.value,
                content: content
            })
        }
    )
}

const saveModeNew = async (mode, content) => {
    return await $fetch(`${API}novels/${props.novel_id}/chapters/edit/new?query=${mode}`,
        {
            method: "POST",
            headers: headers.value,
            body: JSON.stringify({
                title: chapterTitle.value,
                content: content
            })
        }
    )
}

const updateDetails = async (mode, content) => {
    return await $fetch(`${API}novels/${props.novel_id}/chapters/edit/${props.id}?query=${mode}`,
        {
            method: "PUT",
            headers: headers.value,
            body: JSON.stringify({
                title: chapterTitle.value,
                content: content
            })
        }
    )
}
// Chapter panel functions
const toggleChapterPanel = () => {
  showChapterPanel.value = !showChapterPanel.value
    if (showChapterPanel.value) {
        fetchChapters('pub');  // Fetch chapters when panel is opened
    }
}

// Create a new chapter
const createNewChapter = () => {
  // Implementation:  Route to a new chapter page.  This is a simplified example.
  // You would likely want to create a new chapter in your backend first,
  // then navigate to the edit page for that new chapter.
  navigateTo(`/edit/${props.novel_id}/chapter/new`);
}

// Select a chapter
const selectChapter = (id) => {
  currentChapter.value = id
  showChapterPanel.value = false; // Close the panel
  // Load chapter content.  This is a placeholder; replace with an API call.
  // fetchChapterContent(props.novel_id, id);
    navigateTo(`/edit/${props.novel_id}/chapter/${id}?mode=draft`)

}

// Fetch chapters
const fetchChapters = async (type) => {
  const data = await $fetch(`${API}novels/${props.novel_id}`,{
    headers: headers.value,
    params:{
      limit:5,
      order:"desc",
      sort: "chapterNumber",
      type:type
    }
  })

  chapters.value = data.chapters
  console.log(chapters.value)
  return
}

// Utility panel
const toggleUtilityPanel = () => {
  showUtilityPanel.value = !showUtilityPanel.value
}

// AI toggle
const toggleAI = () => {
    if (!showAI.value) {
        // Get plain text content for the AI
        chapterContent.value = activeEditor.value.getContent({ format: 'text' });
        showAI.value = true;
    } else {
        showAI.value = false;
        chapterContent.value = ""; // Clear the context when closing
    }
}

// Grammar check
const checkGrammar = async () => {
    try {
        grammarChecking.value = true;
        analysisResults.errors = null; // Clear previous errors

        const textContent = activeEditor.value.getContent({ format: 'text' });

        const response = await $fetch(`${API}checker/grammar`, {
            method: 'POST',
            headers: headers.value,
            body: JSON.stringify({ text: textContent })
        });
        analysisResults.grammar = true;
        analysisResults.check = response.check;

        if (response) {
            analysisResults.errors = response.errors;
        }
    } catch (error) {
        console.error('Grammar check failed:', error);
        analysisResults.grammar = false;
        analysisResults.errors = 'Failed to perform grammar check. Please try again.';
    } finally {
        grammarChecking.value = false;
    }
}

// Shortcut functions
const closeModal = () => {
  shortCutKeyPressed.value = false
  resetShortcutState(); // Reset state when closing
}

const handleSelect = (result) => {
  // Implementation.  This will depend on what your shortcuts do.
  console.log("Shortcut selected:", result);
    shortCutKeyPressed.value = false;
    activeEditor.value.selection.moveToBookmark(currentEditorCursor.value);
    activeEditor.value.focus();
    activeEditor.value.execCommand('mceInsertContent', false, `${result.name} `);
  closeModal();
}

const handleShortCutResult = (result) => {
  // Implementation. This handles results *within* the Entity Panel
  console.log("Shortcut result from Entity Panel:", result);
}

const handleGroupUpdate = async (newGroup) =>{
  await $store.setGroups(newGroup)
  groups.value = newGroup
}

//Filtered chapter computed
const filteredChaptersComputed = computed(() => {
    if (!searchQuery.value) return chapters.value;
    const query = searchQuery.value.toLowerCase();
    return chapters.value.filter(chapter =>
        chapter.title.toLowerCase().includes(query)
    );
});

// Add these methods for shortcut functionality
const currentEditorCursor = ref(null)
var atSymbolCount = 0
var lastKeyWasAt = false
var lastAtTime = 0
const MatchPriority = {
    EXACT_SHORTCUT: 4,
    SHORTCUT_WITH_INDEX: 3,
    CHILD_MATCH: 2,
    PARTIAL_MATCH: 1
};

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


onMounted(async () => {
  // Check for saved mode preference

  console.log(props.content)
  const savedDarkMode = localStorage.getItem('editor-dark-mode')
  if (savedDarkMode !== null) {
    isDarkMode.value = savedDarkMode === 'true'
  }

    imageSrc.value = `${useRuntimeConfig().public.imageUrl}/${user.image}`
    headers.value = await $store.getNormalHeaders();

  // Add event listener for clicking outside dropdown
  document.addEventListener('click', handleClickOutside)

     groups.value = await $store.getGroups()

  // Initialize the editor with the current theme
  await nextTick()
  initializeEditor(props.content)

  // Set loading to false
  loading.value = false

    if (!props.isNew) {
        // Fetch initial chapters if not a new chapter
        fetchChapters('draft');  // Or any other appropriate type
    }
});

onBeforeUnmount(() => {
  destroy_editor()
  document.removeEventListener('click', handleClickOutside)
})

// Watch for changes in isDarkMode to update chapterContent
watch(() => isDarkMode.value, () => {
  // The editor is reinitialized in toggleDarkMode
})



watch(searchQuery, (newQuery) => {
    if(!newQuery){
        filteredChapters.value = chapters.value
        return
    }

    filteredChapters.value = chapters.value.filter(chapter =>
      chapter.title.toLowerCase().includes(newQuery.toLowerCase())
    );
})

</script>

<template>
  <div :class="['min-h-screen flex flex-col', isDarkMode ? 'dark bg-gray-900 text-white' : 'bg-white text-gray-900']">
    <!-- Top Navigation Bar -->
    <nav :class="['border-b px-4 py-2 flex items-center justify-between sticky top-0 z-20', isDarkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white']">
      <div class="flex items-center space-x-2">
        <NuxtLink :to="`/edit/${novel_id}`" :class="['inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md transition duration-200', isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100']">
          <ArrowBigLeft class="w-4 h-4" />
          Back
        </NuxtLink>

        <!-- Save Button with Dropdown -->
        <div class="relative inline-block">
          <button 
            @click="toggleSaveMenu"
            :class="['inline-flex items-center gap-2 px-3 py-1.5 text-sm rounded-md save-button-ref transition duration-200', isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100']"
          >
            <Save class="w-4 h-4" />
            Save
          </button>
          <transition
            enter-active-class="transition ease-out duration-200"
            enter-from-class="transform opacity-0 scale-95"
            enter-to-class="transform opacity-100 scale-100"
            leave-active-class="transition ease-in duration-150"
            leave-from-class="transform opacity-100 scale-100"
            leave-to-class="transform opacity-0 scale-95"
          >
            <div v-show="showSaveMenu" 
                 :class="['absolute z-50 mt-1 rounded-md shadow-lg border py-1 w-48 dropdown-ref', 
                          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
              <button 
                @click="saveAsDraft"
                :class="['w-full text-left px-4 py-2 text-sm transition duration-200', isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100']"
              >
                Save as Draft
              </button>
              <button 
                @click="saveAsUnpublished"
                :class="['w-full text-left px-4 py-2 text-sm transition duration-200', isDarkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-100']"
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
            :class="['inline-flex items-center gap-2 px-3 py-1.5 text-sm text-white rounded-md transition duration-200', 
                    isDarkMode ? 'bg-green-700 hover:bg-green-800' : 'bg-green-600 hover:bg-green-700']"
          >
            <Upload class="w-4 h-4" />
          </button>
        </UTooltip>
      </div>
      <div class="flex items-center space-x-3">
        <!-- Dark Mode Toggle Button -->
        <button 
          @click="toggleDarkMode" 
          :class="['px-3 py-1.5 rounded-md text-sm transition-colors duration-200', 
                  isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-gray-200 hover:bg-gray-300 text-gray-800']"
        >
          {{ isDarkMode ? 'Light Mode' : 'Dark Mode' }}
        </button>
        <AvatarRoot class="transition duration-200">
          <AvatarImage :src="imageSrc" />
          <AvatarFallback :class="['transition duration-200', isDarkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-700']">
            {{ user.username.charAt(0) }}
          </AvatarFallback>
        </AvatarRoot>
      </div>
    </nav>

    <!-- Shortcut Modal with Theme Support -->
    <ShortcutModal 
      :class="['z-[10000]', isDarkMode ? 'dark-theme' : 'light-theme']"
      :groups="groups" 
      :posX="shortCutModalX" 
      :posY="shortCutModalY"
      :visible="shortCutKeyPressed"
      :search="searchTerm"
      :theme="isDarkMode ? 'dark' : 'light'"
      @result="handleSelect"
      @close="closeModal"
    ></ShortcutModal>
  
    <div class="flex-1 flex relative">
      <!-- Main Writing Area -->
      <div class="flex-1 transition-all duration-300 w-full">
        <div class="h-full flex flex-col">
          <!-- Writing Space -->
          <div :class="['flex-1 p-8 mx-auto w-full overflow-y-auto transition-colors duration-300', isDarkMode ? 'bg-gray-900' : 'bg-gray-50']">
            <div class="max-w-none">
              <input
                v-model="chapterTitle"
                type="text"
                placeholder="Chapter Title"
                :class="['w-full text-3xl font-bold mb-4 p-2 border-none focus:outline-none focus:ring-2 rounded-md transition-colors duration-200',
                        isDarkMode ? 'bg-gray-800 text-white focus:ring-blue-600 placeholder-gray-500' : 'bg-white text-gray-900 focus:ring-blue-200 placeholder-gray-400']"
              />

              <!-- TinyMCE Editor -->
              <div :class="['editor-container rounded-lg shadow-lg overflow-hidden transition-shadow duration-200', isDarkMode ? 'shadow-gray-800' : 'shadow-gray-200']">
                <textarea id="txttinyeditor"></textarea>
                <div id="mask" :class="['transition-colors duration-300', isDarkMode ? 'bg-gray-800' : 'bg-white']"></div>
              </div>
 
              <button 
                @click="saveAsDraft" 
                :class="['responsive-button mt-6 px-4 py-2 text-sm text-white rounded-md transition duration-200', 
                        isDarkMode ? 'bg-green-700 hover:bg-green-800' : 'bg-green-600 hover:bg-green-700']"
              >
                Save
              </button>
            </div>
          </div>
        </div>
      </div>

      <!-- Floating Action Buttons -->
      <WriterTools 
        class="z-[11]" 
        @toggleChapterPanel="toggleChapterPanel" 
        @toggleAI="toggleAI"
        :isDarkMode="isDarkMode"
      />

      <!-- Redesigned Chapter Panel -->
      <transition
        enter-active-class="transition ease-out duration-300"
        enter-from-class="transform opacity-0 translate-y-4"
        enter-to-class="transform opacity-100 translate-y-0"
        leave-active-class="transition ease-in duration-200"
        leave-from-class="transform opacity-100 translate-y-0"
        leave-to-class="transform opacity-0 translate-y-4"
      >
        <div 
          v-show="showChapterPanel" 
          :class="['fixed right-4 bottom-20 z-50 w-80 rounded-lg shadow-xl border backdrop-blur-sm transition-all duration-300', 
                isDarkMode ? 'bg-gray-800/95 border-gray-700 shadow-gray-900/50' : 'bg-white/95 border-gray-200 shadow-gray-300/30']"
        >
          <div class="p-4">
            <div class="flex flex-col items-center justify-between mb-4">
              <div class="w-full flex justify-between items-center mb-3">
                <h3 :class="['font-semibold text-lg', isDarkMode ? 'text-gray-200' : 'text-gray-800']">Chapters</h3>
                <button 
                  @click="toggleChapterPanel"
                  :class="['p-1 rounded-full transition duration-200', isDarkMode ? 'hover:bg-gray-700 text-gray-400 hover:text-gray-200' : 'hover:bg-gray-200 text-gray-600 hover:text-gray-800']"
                >
                  <X class="w-4 h-4" />
                </button>
              </div>
              
              <div class="panel-btn-container flex flex-row mb-4 gap-2 w-full">
                <button 
                  :class="['panel-btn-class flex-1 transition duration-200 font-medium', 
                          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700']" 
                  @click="fetchChapters('pub')"
                >
                  Published
                </button>
                <button 
                  :class="['panel-btn-class flex-1 transition duration-200 font-medium', 
                          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700']" 
                  @click="fetchChapters('unpub')"
                >
                  Unpublished
                </button>
                <button 
                  :class="['panel-btn-class flex-1 transition duration-200 font-medium', 
                          isDarkMode ? 'bg-gray-700 hover:bg-gray-600 text-gray-200' : 'bg-gray-100 hover:bg-gray-200 text-gray-700']" 
                  @click="fetchChapters('draft')"
                >
                  Drafts
                </button>
              </div>
              
              <div class="relative w-full mb-2">
                <input
                  v-model="searchQuery"
                  type="text"
                  placeholder="Search chapters..."
                  :class="['pl-8 pr-3 py-2 text-sm border rounded-lg w-full transition-colors duration-200', 
                          isDarkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400 focus:border-blue-500 focus:ring-1 focus:ring-blue-500' : 
                          'bg-white border-gray-300 text-gray-900 placeholder-gray-500 focus:border-blue-400 focus:ring-1 focus:ring-blue-400']"
                />
                <Search :class="['w-4 h-4 absolute left-2.5 top-2.5 transition-colors duration-200', isDarkMode ? 'text-gray-400' : 'text-gray-500']" />
              </div>
            </div>
            
            <div :class="['max-h-96 overflow-y-auto pr-1 space-y-1.5', isDarkMode ? 'scrollbar-dark' : 'scrollbar-light']">
              <div 
                v-for="chapter in filteredChapters" 
                :key="chapter.id"
                :class="[
                  'p-2.5 rounded-md cursor-pointer transition-all duration-200 flex items-center justify-between group',
                  currentChapter === chapter.id ? 
                    (isDarkMode ? 'bg-blue-900/70 text-blue-100' : 'bg-blue-50 text-blue-800 border border-blue-200') : 
                    (isDarkMode ? 'hover:bg-gray-700/70 text-gray-300 hover:text-gray-100' : 'hover:bg-gray-100 text-gray-700')
                ]"
                @click="selectChapter(chapter.id)"
              >
                <span class="truncate">{{ chapter.title }}</span>
                <div :class="['opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex space-x-1', 
                             isDarkMode ? 'text-gray-400' : 'text-gray-500']">
                  <button class="p-1 rounded hover:bg-opacity-20" 
                          :class="isDarkMode ? 'hover:bg-gray-600' : 'hover:bg-gray-200'">
                    <Search class="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
              
              <button 
                :class="['w-full p-2.5 rounded-md cursor-pointer transition-all duration-200 flex items-center justify-center space-x-2', 
                        isDarkMode ? 'bg-blue-800/40 hover:bg-blue-800/60 text-blue-200' : 'bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200']"
                @click="createNewChapter"
              >
                <PlusIcon class="w-4 h-4" />
                <span>New Chapter</span>
              </button>
            </div>
          </div>
        </div>
      </transition>

      <!-- Redesigned Utility Sidebar Toggle Button -->
      <!-- Use PanelRightClose when the panel is open -->
        <button
            @click="toggleUtilityPanel"
            :class="[
            'fixed z-[11] top-1/2 transform -translate-y-1/2 transition-all duration-300 flex items-center justify-center rounded-l-lg shadow-lg h-12 w-12',
            showUtilityPanel ? 'right-[300px]' : 'right-0',
            isDarkMode
                ? showUtilityPanel
                ? 'bg-gray-700 hover:bg-gray-600 text-gray-200'
                : 'bg-blue-800 hover:bg-blue-700 text-white'
                : showUtilityPanel
                ? 'bg-gray-200 hover:bg-gray-300 text-gray-700'
                : 'bg-blue-600 hover:bg-blue-500 text-white'
            ]"
        >
            <PanelRightOpenIcon
            v-if="!showUtilityPanel"
            :class="['w-5 h-5 transition-transform duration-300', isDarkMode ? 'text-white' : 'text-white']"
            />
            <PanelRightClose
            v-else
            :class="['w-5 h-5 transition-transform duration-300', isDarkMode ? 'text-gray-200' : 'text-white']"
            />
        </button>

  
      <!-- Redesigned Utility Sidebar -->
      <div 
        :class="[
          'fixed top-0 right-0 h-full z-10 shadow-lg transition-all duration-300 border-l',
          showUtilityPanel ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0',
          isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200',
          'w-[300px]'
        ]"
      >
        <div :class="['h-full flex flex-col pt-14', isDarkMode ? 'text-gray-200' : 'text-gray-800']">
          <!-- Tab Navigation -->
          <div :class="['flex border-b sticky top-0 z-10 transition-colors duration-200', isDarkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200']">
            <button
              v-for="tab in tabs"
              :key="tab.value"
              :class="[
                'flex items-center px-4 py-3 flex-1 justify-center transition-all duration-200',
                activeTab === tab.value ? 
                  (isDarkMode ? 'border-b-2 border-blue-500 text-blue-400 bg-gray-700/50' : 'border-b-2 border-blue-600 text-blue-600 bg-gray-50') : 
                  (isDarkMode ? 'text-gray-400 hover:bg-gray-700/50' : 'text-gray-600 hover:bg-gray-50')
              ]"
              @click="activeTab = tab.value"
            >
              <component :is="tab.icon" class="w-4 h-4 mr-2"></component>
              {{ tab.label }}
            </button>
          </div>
      
          <!-- Tab Content -->
          <div class="flex-1 overflow-y-auto">
            <!-- Entities Tab -->
            <div v-show="activeTab === 'entities'" class="p-4">
              <KeepAlive>
                <EntityPanel 
                  :groups="groups" 
                  :shortCutKeyPressed="shortCutKeyPressed" 
                  :shortCutKey="shortCutKey" 
                  @result="handleShortCutResult"
                  @update-group="handleGroupUpdate"
                  :isDarkMode="isDarkMode"
                ></EntityPanel>
              </KeepAlive>
            </div>
        
            <!-- Plot Tab -->
            <div v-show="activeTab === 'plot'" class="p-4">
              <PlotStructure :editor="activeEditor" :isDarkMode="isDarkMode" />
            </div>
        
            <!-- Analysis Tab -->
            <div v-if="activeTab === 'analysis'" class="p-4 space-y-4">
              <div :class="['rounded-lg shadow transition-colors duration-200', isDarkMode ? 'bg-gray-700' : 'bg-gray-50']">
                <div class="p-4 space-y-4">
                  <h3 :class="['font-medium mb-3', isDarkMode ? 'text-gray-200' : 'text-gray-800']">Grammar Check</h3>
                  
                  <button 
                    @click="checkGrammar"
                    :disabled="grammarChecking"
                    :class="[
                      'w-full inline-flex items-center justify-center gap-2 px-4 py-2 text-sm rounded-md transition-all duration-200',
                      grammarChecking ? 
                        (isDarkMode ? 'bg-gray-600 cursor-not-allowed text-gray-400' : 'bg-gray-300 cursor-not-allowed text-gray-500') : 
                        (isDarkMode ? 'bg-blue-700 hover:bg-blue-600 text-white' : 'bg-blue-600 hover:bg-blue-700 text-white')
                    ]"
                  >
                    <template v-if="!grammarChecking">
                      <Check class="w-4 h-4" />
                      Check Grammar
                    </template>
                    <template v-else>
                      <span class="animate-pulse">Checking...</span>
                    </template>
                  </button>
        
                  <div v-if="analysisResults.check" class="mt-4">
                    <div :class="[
                      'flex items-center gap-2 p-3 rounded-md transition-colors duration-200', 
                      analysisResults.check === 'PASSED' ? 
                        (isDarkMode ? 'bg-green-900/30 text-green-300' : 'bg-green-50 text-green-700 border border-green-200') : 
                        (isDarkMode ? 'bg-red-900/30 text-red-300' : 'bg-red-50 text-red-700 border border-red-200')
                    ]">
                      <Check v-if="analysisResults.grammar" class="w-4 h-4" />
                      <X v-else class="w-4 h-4" />
                      Grammar check {{ analysisResults.check === 'PASSED' ? 'passed' : 'failed' }}
                    </div>
                  </div>
        
                  <div v-if="analysisResults.errors" 
                       :class="['text-sm p-3 rounded-md transition-colors duration-200', 
                                isDarkMode ? 'bg-red-900/50 text-red-400' : 'bg-red-100 text-red-700 border border-red-200']">
                    <div v-for="(error, index) in analysisResults.errors" :key="index" class="mb-1">
                      {{ error }}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <ModernChatBotStylish v-if="showAI" :context="chapterContent" @close="toggleAI" :isDarkMode="isDarkMode"></ModernChatBotStylish>
  </div>
</template>

<style scoped>
/*  General Styles & Resets  */
.responsive-button {
  @apply px-4 py-2 text-sm; /* Smaller on small screens */
}

@media (min-width: 640px) { /* sm breakpoint and up */
  .responsive-button {
    @apply px-6 py-3 text-base; /* Larger on larger screens */
  }
}

/*  Utility Panel  */
.utility-sidebar {
  width: 300px; /* Fixed width */
}

.panel-btn-class {
  @apply px-3 py-1.5 text-sm rounded-md;
}

/* Scrollbar Styling */
.scrollbar-dark::-webkit-scrollbar {
  width: 8px;
}
.scrollbar-dark::-webkit-scrollbar-track {
  background: #2d3748; /* Dark track */
}
.scrollbar-dark::-webkit-scrollbar-thumb {
  background: #4a5568; /* Dark thumb */
  border-radius: 4px;
}
.scrollbar-dark::-webkit-scrollbar-thumb:hover {
  background: #718096; /* Slightly lighter on hover */
}

.scrollbar-light::-webkit-scrollbar {
  width: 8px;
}
.scrollbar-light::-webkit-scrollbar-track {
  background: #f7fafc; /* Light track */
}
.scrollbar-light::-webkit-scrollbar-thumb {
  background: #cbd5e0; /* Light thumb */
  border-radius: 4px;
}
.scrollbar-light::-webkit-scrollbar-thumb:hover {
  background: #a0aec0; /* Slightly darker on hover */
}

/*  Dark Mode Modal Styles (for ShortcutModal) */
.dark-theme {
  --modal-bg: #1f2937;
  --modal-border: #374151;
  --modal-text: #e5e7eb;
  --modal-highlight: #3b82f6;
  --modal-highlight-text: #ffffff;
  --modal-input-bg: #374151;
  --modal-input-text: #e5e7eb;
  --modal-placeholder-text: #9ca3af;
  --modal-option-hover-bg: #4a5568;
}

.light-theme{
    --modal-bg: #fff;
    --modal-border: #e2e8f0;
    --modal-text: #2d3748;
    --modal-highlight: #3b82f6;
    --modal-highlight-text: #fff;
    --modal-input-bg: #f7fafc;
    --modal-input-text: #2d3748;
    --modal-placeholder-text: #a0aec0;
    --modal-option-hover-bg: #edf2f7;
}
</style>