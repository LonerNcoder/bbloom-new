<template>
    <div class="ml-4 mb-4 w-full">
      <!-- Main plot item container: clicking toggles expansion -->
      <div
        class="flex items-center justify-between p-2 border rounded-md cursor-pointer hover:bg-gray-100"
        @click="toggleExpand"
      >
        <div>
          <span class="font-semibold">{{ plot.title }}</span>
          <span
            class="ml-2 text-sm"
            :class="plot.completed ? 'text-green-500' : 'text-gray-500'"
          >
            {{ plot.completed ? 'Completed' : 'In Progress' }}
          </span>
          <span v-if="plot.children.length" class="ml-2 text-xs text-blue-500">
            ({{ plot.children.length }} subplots)
          </span>
        </div>
        <!-- Vertical three-dot menu -->
        <div class="relative" ref="menuRef">
          <button @click.stop="toggleMenu" class="p-1 focus:outline-none">
            <span>⋮</span>
          </button>
          <div
            v-if="showMenu"
            class="absolute right-0 mt-2 w-32 bg-white border rounded-md shadow-lg z-10"
          >
            <button
              @click.stop="openEditModal"
              class="block w-full text-left px-2 py-1 hover:bg-gray-100"
            >
              Edit
            </button>
            <button
              @click.stop="deletePlot"
              class="block w-full text-left px-2 py-1 hover:bg-gray-100"
            >
              Delete
            </button>
            <button
              @click.stop="markComplete"
              class="block w-full text-left px-2 py-1 hover:bg-gray-100"
            >
              {{ plot.completed ? 'Mark Incomplete' : 'Mark Complete' }}
            </button>
          </div>
        </div>
      </div>
  
      <!-- Expanded view: shows the View Details button and one level of subplots -->
      <div v-if="isExpanded" class="ml-4 mt-2">
        <button
          @click.stop="openSummaryModal"
          class="text-sm text-blue-500 underline mb-2"
        >
          View Details
        </button>
        <!-- Render one level of subplots -->
        <div class="flex flex-col">
          <div
            v-for="child in plot.children"
            :key="child.id"
            class="flex items-center"
          >
            <PlotItem
              :plot="child"
              @edit="handleChildEdit"
              @delete="handleChildDelete"
              @toggleComplete="$emit('toggleComplete', $event)"
              @addSubplot="(a, b) => $emit('addSubplot', a, b)"
              @update="$emit('update', $event)"
            />
          </div>
          <!-- Plus icon for adding new subplot -->
          <div class="mt-2">
            <button
              @click.stop="showAddSubplotModal = true"
              class="text-blue-500 flex items-center"
            >
              <span class="text-xl">+</span>
              <span class="ml-1 text-sm">Add Subplot</span>
            </button>
          </div>
        </div>
      </div>
  
      <!-- Add Subplot Modal -->
      <div
        v-if="showAddSubplotModal"
        class="fixed z-[1000] inset-0 flex items-center justify-center bg-black bg-opacity-50"
        @click.self="showAddSubplotModal = false"
      >
        <div class="bg-white p-4 rounded-md shadow-lg relative max-w-lg w-full">
          <button
            @click="showAddSubplotModal = false"
            class="absolute top-0 right-0 m-2 text-gray-600 text-xl leading-none"
          >
            &times;
          </button>
          <h3 class="text-xl font-semibold mb-2">Add Subplot</h3>
          <div class="mb-2">
            <input
              v-model="newSubplotTitle"
              placeholder="Subplot Title"
              class="border p-1 rounded-md w-full"
            />
          </div>
          <div class="mb-2 flex items-start">
            <textarea
              v-model="newSubplotSummary"
              placeholder="Subplot Summary"
              class="border p-1 rounded-md w-full"
              rows="2"
              :disabled="isGeneratingSubplotSummary"
            ></textarea>
            <button @click="generateSubplotSummary" class="ml-2 p-1">
              <span v-if="!isGeneratingSubplotSummary">💡</span>
              <span v-else class="animate-spin">🔄</span>
            </button>
          </div>
          <div class="mt-2 flex space-x-2 items-center">
            <h3 class="font-semibold">
              Planned Chapters for the Subplot
            </h3>
            <input
              type="number"
              v-model.number="newSubplotRangeMin"
              min="1"
              class="border p-1 rounded-md w-24"
              placeholder="From"
            />
            <input
              type="number"
              v-model.number="newSubplotRangeMax"
              min="1"
              class="border p-1 rounded-md w-24"
              placeholder="To"
            />
          </div>
          <div class="flex justify-end space-x-2 mt-4">
            <button
              @click="submitSubplot"
              class="bg-green-500 text-white px-4 py-2 rounded-md"
            >
              Add Subplot
            </button>
            <button
              @click="showAddSubplotModal = false"
              class="text-gray-500 px-4 py-2 rounded-md border"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
  
      <!-- Summary Modal -->
      <div
        v-if="showSummaryModal"
        class="fixed inset-0 z-[1000] flex items-center justify-center bg-black bg-opacity-50"
        @click.self="closeSummaryModal"
      >
        <div class="bg-white p-4 rounded-md shadow-lg relative max-w-lg w-full">
          <button
            @click="closeSummaryModal"
            class="absolute top-0 right-0 m-2 text-gray-600 text-xl leading-none"
          >
            &times;
          </button>
          <h3 class="text-xl font-semibold mb-2">{{ plot.title }} Details</h3>
          <p class="text-gray-700">{{ plot.summary }}</p>
          <br />
          <h4 class="text-xl font-semibold mb-2">Chapter Range</h4>
          <p class="text-gray-800">
            {{ plot.chapterRange.min }} to {{ plot.chapterRange.max }}
          </p>
        </div>
      </div>
  
      <!-- Edit Modal -->
      <div
        v-if="showEditModal"
        class="fixed z-[1000] inset-0 flex items-center justify-center bg-black bg-opacity-50"
        @click.self="closeEditModal"
      >
        <div class="bg-white p-4 rounded-md shadow-lg relative max-w-lg w-full">
          <button
            @click="closeEditModal"
            class="absolute top-0 right-0 m-2 text-gray-600 text-xl leading-none"
          >
            &times;
          </button>
          <h3 class="text-xl font-semibold mb-2">Edit Plot</h3>
          <div class="mb-2">
            <label class="block text-sm font-medium">Title</label>
            <input
              v-model="editableTitle"
              class="border p-1 rounded-md w-full"
            />
          </div>
          <div class="mb-2">
            <label class="block text-sm font-medium">Summary</label>
            <textarea
              v-model="editableSummary"
              class="border p-1 rounded-md w-full"
              rows="3"
            ></textarea>
          </div>
          <div class="mb-2 flex space-x-2">
            <div>
              <label class="block text-sm font-medium">Chapter Range From</label>
              <input
                type="number"
                v-model.number="editableRangeMin"
                min="1"
                class="border p-1 rounded-md w-full"
              />
            </div>
            <div>
              <label class="block text-sm font-medium">To</label>
              <input
                type="number"
                v-model.number="editableRangeMax"
                min="1"
                class="border p-1 rounded-md w-full"
              />
            </div>
          </div>
          <div class="flex justify-end space-x-2">
            <button
              @click="submitEdit"
              class="bg-blue-500 text-white px-2 py-1 rounded-md text-sm"
            >
              Save
            </button>
            <button
              @click="closeEditModal"
              class="text-sm text-gray-500"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { ref, onMounted, onBeforeUnmount } from 'vue'
  
  const props = defineProps({
    plot: Object
  })
  const emit = defineEmits(['edit', 'delete', 'toggleComplete', 'addSubplot', 'update'])
  
  const isExpanded = ref(false)
  const showMenu = ref(false)
  const showSummaryModal = ref(false)
  const showEditModal = ref(false)
  const showAddSubplotModal = ref(false)
  
  const newSubplotTitle = ref('')
  const newSubplotSummary = ref('')
  const newSubplotRangeMin = ref(1)
  const newSubplotRangeMax = ref(10)
  const isGeneratingSubplotSummary = ref(false)
  
  // Editable fields for the edit modal
  const editableTitle = ref('')
  const editableSummary = ref('')
  const editableRangeMin = ref(1)
  const editableRangeMax = ref(10)
  
  // For three-dot menu click outside detection
  const menuRef = ref(null)
  function handleClickOutside(event) {
    if (menuRef.value && !menuRef.value.contains(event.target)) {
      showMenu.value = false
    }
  }
  
  onMounted(() => {
    document.addEventListener('click', handleClickOutside)
  })
  onBeforeUnmount(() => {
    document.removeEventListener('click', handleClickOutside)
  })
  
  function toggleExpand() {
    isExpanded.value = !isExpanded.value
  }
  
  function toggleMenu() {
    showMenu.value = !showMenu.value
  }
  
  function openSummaryModal() {
    showSummaryModal.value = true
  }
  
  function closeSummaryModal() {
    showSummaryModal.value = false
  }
  
  function openEditModal() {
    // Pre-fill edit fields with current plot data
    editableTitle.value = props.plot.title
    editableSummary.value = props.plot.summary
    editableRangeMin.value = props.plot.chapterRange.min
    editableRangeMax.value = props.plot.chapterRange.max
    showEditModal.value = true
    showMenu.value = false
  }
  
  function closeEditModal() {
    showEditModal.value = false
  }
  
  function submitEdit() {
    // Emit updated data to parent
    emit('update', {
      ...props.plot,
      title: editableTitle.value,
      summary: editableSummary.value,
      chapterRange: {
        min: editableRangeMin.value,
        max: editableRangeMax.value
      }
    })
    showEditModal.value = false
  }
  
  function deletePlot() {
    emit('delete', props.plot.id)
    showMenu.value = false
  }
  
  function markComplete() {
    emit('toggleComplete', props.plot.id)
    showMenu.value = false
  }
  
  function handleChildEdit(childPlot) {
    emit('edit', childPlot)
  }
  
  function handleChildDelete(childId) {
    emit('delete', childId)
  }
  
  function submitSubplot() {
    if (!newSubplotTitle.value) return
    emit('addSubplot', props.plot.id, {
      title: newSubplotTitle.value,
      summary: newSubplotSummary.value,
      chapterRange: {
        min: newSubplotRangeMin.value,
        max: newSubplotRangeMax.value
      },
      completed: false,
      children: []
    })
    newSubplotTitle.value = ''
    newSubplotSummary.value = ''
    newSubplotRangeMin.value = 1
    newSubplotRangeMax.value = 10
    showAddSubplotModal.value = false
  }
  
  // Simulate AI summary generation for a subplot
  function generateSubplotSummary() {
    isGeneratingSubplotSummary.value = true
    setTimeout(() => {
      newSubplotSummary.value = "AI generated subplot summary for: " + newSubplotTitle.value
      isGeneratingSubplotSummary.value = false
    }, 2000)
  }
  </script>
  
  <style scoped>
  /* Additional styling and transitions can be added here */
  </style>
  