<template>
    <div>
      <div class="flex flex-row items-center justify-between mb-6">
        <h1 class="font-semibold ">Plot Structure</h1>
        <!-- Top buttons for adding a plot, checking plots, and import/export -->
        <div class="flex flex-row items-center space-x-2">
          <UTooltip text="Add Root Plot">
            <button @click="showAddRootPlotModal = true">
              <GitBranchPlus />
            </button>
          </UTooltip>
          <UTooltip text="Check Plot Consistency">
            <button @click="openPlotChecker">
              <ShieldAlert />
            </button>
          </UTooltip>
          <UTooltip text="Export Plot Structure">
            <button @click="exportPlots">
              <Download />
            </button>
          </UTooltip>
          <UTooltip text="Import Plot Structure" :shortcuts="['⌘', 'O']">
            <button @click="triggerFileInput">
              <Import />
            </button>
          </UTooltip>
          <!-- Hidden file input for JSON import -->
          <input
            type="file"
            accept=".json"
            ref="fileInput"
            @change="handleFileUpload"
            style="display: none"
          />
        </div>
      </div>
  
      <!-- Plot List or Empty State -->
      <div>
        <!-- If there are plots, display them -->
        <div v-if="plots.length > 0">
          <PlotItem
            v-for="plot in plots"
            :key="plot.id"
            :plot="plot"
            @delete="deletePlot"
            @update="updatePlot"
            @addSubplot="addSubplot"
            @toggleComplete="toggleComplete"
          />
        </div>
        <!-- If no plots, display the centered plus button -->
        <div v-else class="flex justify-center items-center h-64">
          <button
            @click="showAddRootPlotModal = true"
            class="bg-blue-500 hover:bg-blue-600 text-white rounded-full p-4 focus:outline-none"
          >
            <Plus class="w-6 h-6" />
          </button>
        </div>
      </div>
  
      <!-- Add Root Plot Modal -->
      <div
        v-if="showAddRootPlotModal"
        class="fixed inset-0 z-[800] flex items-center justify-center bg-black bg-opacity-50"
        @click.self="showAddRootPlotModal = false"
      >
        <div class="bg-white p-4 rounded-md shadow-lg relative max-w-lg w-full">
          <button
            @click="showAddRootPlotModal = false"
            class="absolute top-0 right-0 m-2 text-gray-600 text-xl leading-none"
          >
            &times;
          </button>
          <h3 class="text-xl font-semibold mb-2">Add Root Plot</h3>
          <div class="mb-2">
            <input
              v-model="newPlotTitle"
              placeholder="Plot Title"
              class="border p-2 rounded-md w-full"
            />
          </div>
          <div class="mb-2">


            <textarea
              v-model="newPlotSummary"
              placeholder="Plot Summary (max 300 words)"
              class="border p-2 rounded-md w-full"
              rows="3"
            ></textarea>
          </div>
          <div class="mt-2 flex space-x-2 items-center">
            <h3 class="font-semibold">
              Planned Chapters for the Plot
              <span class="text-xs">(important for plothole checker)</span>
            </h3>
            <input
              type="number"
              v-model.number="newChapterRangeMin"
              min="1"
              class="border p-2 rounded-md w-24"
              placeholder="From"
            />
            <input
              type="number"
              v-model.number="newChapterRangeMax"
              min="1"
              class="border p-2 rounded-md w-24"
              placeholder="To"
            />
          </div>
          <div class="flex justify-end space-x-2 mt-4">
            <button
              @click="submitAddRootPlot"
              class="bg-blue-500 text-white px-4 py-2 rounded-md"
            >
              Add Plot
            </button>
            <button
              @click="showAddRootPlotModal = false"
              class="text-gray-500 px-4 py-2 rounded-md border"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
  
      <!-- Plot Checker Modal (for selecting plots) -->
      <div
        v-if="showPlotCheckerModal"
        class="fixed inset-0 z-[800] flex items-center justify-center bg-black bg-opacity-50"
        @click.self="closePlotChecker"
      >
        <div class="bg-white p-4 rounded-md shadow-lg relative max-w-xl w-full">
          <button
            @click="closePlotChecker"
            class="absolute top-0 right-0 m-2 text-gray-600 text-xl leading-none"
          >
            &times;
          </button>
          <h3 class="text-xl font-semibold mb-2">Plot Checker</h3>
          <!-- Selected Plots Badges -->
          <div class="mb-4">
            <span
              v-for="sel in selectedPlots"
              :key="sel.id"
              class="inline-flex items-center bg-gray-200 text-gray-800 rounded-full px-3 py-1 mr-2 mb-2"
            >
              {{ sel.title }}
              <button
                @click="removePlotFromSelection(sel.id)"
                class="ml-1 text-red-500 font-bold"
              >
                ×
              </button>
            </span>
          </div>
          <!-- Search Bar and Label -->
          <div class="mb-2">
            <label class="block font-semibold mb-1" for="plotSearch">
              Add Plot Dependencies
            </label>
            <input
              id="plotSearch"
              type="text"
              v-model="plotCheckerSearch"
              placeholder="Search plots..."
              class="border p-2 rounded-md w-full"
            />
          </div>
          <!-- Filtered Plot List -->
          <div class="mb-4 max-h-64 overflow-y-auto border rounded-md p-2">
            <div
              v-for="plot in filteredPlots"
              :key="plot.id"
              class="flex flex-col border-b py-1 last:border-b-0"
            >
              <div class="flex justify-between items-center">
                <div>
                  <span class="font-medium">{{ plot.title }}</span>
                </div>
                <button
                  @click="addPlotToSelection(plot)"
                  class="bg-blue-500 text-white px-2 py-1 rounded-md text-sm"
                  :disabled="selectedPlots.some(s => s.id === plot.id) || isAncestorDisabled(plot)"
                  :title="isAncestorDisabled(plot) ? 'The current subplot already contains all of its previous plot.' : ''"
                >
                  Add
                </button>
              </div>
              <!-- Disabled message -->
              <div v-if="isAncestorDisabled(plot)" class="text-red-500 text-xs mt-1">
                The current subplot already contains all of its previous plot.
              </div>
            </div>
          </div>
          <!-- Check Plotholes Button with Spinner -->
          <div class="flex justify-end">
            <button
              @click="checkPlotholes"
              :disabled="isChecking"
              class="bg-blue-500 text-white px-4 py-2 rounded-md flex items-center justify-center"
            >
              <span v-if="isChecking" class="animate-spin mr-2 border-2 border-t-transparent border-white rounded-full w-4 h-4"></span>
              <span v-else>Check Plotholes</span>
            </button>
          </div>
        </div>
      </div>
  
      <!-- Markdown Report Modal -->
      <div
        v-if="showReportModal"
        class="fixed inset-0 z-[1000] rounded-md flex items-center justify-center bg-black bg-opacity-50"
        @click.self="closeReportModal"
      >
        <div class="flex flex-row">
          <h3>Plot Checker Report </h3>
          <button
            @click="closeReportModal"
            class="absolute top-2 right-2 text-gray-600 text-2xl font-bold"
          >
            &times;
          </button>
        </div>
        <div class="bg-white w-full h-full overflow-auto relative p-4">
          <div v-html="reportMarkdown" class="prose max-w-3xl mx-auto"></div>
        </div>
      </div>
  
      <!-- Past Plot Checker Reports List -->
      <div v-if="reports.length" class="mt-8" style="max-height: 500px; overflow: auto;">
        <h2 class="text-xl font-bold mb-4">Past Plot Checker Reports</h2>
        <div class="space-y-2">
          <div
            v-for="report in reports"
            :key="report.id"
            class="flex justify-between items-center p-2 bg-white shadow rounded-md cursor-pointer hover:bg-gray-100"
            @click="viewPastReport(report)"
          >
            <h3 class="font-semibold text-lg">Report from {{ report.date }}</h3>
            <button
              @click.stop="deletePastReport(report.id)"
              class="text-red-500 hover:text-red-700"
              title="Delete Report"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6M1 7h22M8 7V4a1 1 0 011-1h6a1 1 0 011 1v3"/>
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script setup>
  import { reactive, ref, computed } from 'vue'
  import PlotItem from './PlotItem.vue'
  import { v4 as uuidv4 } from 'uuid'
  import { marked } from 'marked'
  // Import icons from lucide-vue-next, including the new Plus icon.
  import { ShieldAlert, GitBranchPlus, ShieldCheck, Download, Import, Plus } from 'lucide-vue-next'
  
  // Props
  const props = defineProps({
    editor: {
      type: Object,
      required: true
    }
  })
  
  /* ---------- Plot Data & Basic CRUD ---------- */
  const newPlotTitle = ref('')
  const newPlotSummary = ref('')
  const newChapterRangeMin = ref(1)
  const newChapterRangeMax = ref(10)
  const showAddRootPlotModal = ref(false)
  const plots = reactive([])
  
  function submitAddRootPlot() {
    if (!newPlotTitle.value) return
    plots.push({
      id: uuidv4(),
      title: newPlotTitle.value,
      summary: newPlotSummary.value,
      completed: false,
      chapterRange: {
        min: newChapterRangeMin.value,
        max: newChapterRangeMax.value
      },
      children: []
    })
    newPlotTitle.value = ''
    newPlotSummary.value = ''
    newChapterRangeMin.value = 1
    newChapterRangeMax.value = 10
    showAddRootPlotModal.value = false
  }
  
  function deletePlot(plotId) {
    function deleteFromList(list) {
      const index = list.findIndex(p => p.id === plotId)
      if (index !== -1) {
        list.splice(index, 1)
        return true
      }
      for (const p of list) {
        if (deleteFromList(p.children)) return true
      }
      return false
    }
    deleteFromList(plots)
    recalcAllChapterRanges()
  }
  
  function updatePlot(updatedPlot) {
    function updateInList(list) {
      for (let i = 0; i < list.length; i++) {
        if (list[i].id === updatedPlot.id) {
          list[i] = updatedPlot
          return true
        } else if (updateInList(list[i].children)) {
          return true
        }
      }
      return false
    }
    updateInList(plots)
    recalcAllChapterRanges()
  }
  
  function addSubplot(parentId, subplot) {
    function addToParent(list) {
      for (const p of list) {
        if (p.id === parentId) {
          p.children.push({
            id: uuidv4(),
            title: subplot.title,
            summary: subplot.summary,
            completed: false,
            chapterRange: {
              min: subplot.chapterRange.min,
              max: subplot.chapterRange.max
            },
            children: []
          })
          return true
        } else if (addToParent(p.children)) {
          return true
        }
      }
      return false
    }
    addToParent(plots)
    recalcAllChapterRanges()
  }
  
  function toggleComplete(plotId) {
    function toggleInList(list) {
      for (const p of list) {
        if (p.id === plotId) {
          p.completed = !p.completed
          return true
        }
        if (toggleInList(p.children)) return true
      }
      return false
    }
    toggleInList(plots)
  }
  
  function recalcChapterRangeForPlot(plot) {
    let minVal = plot.chapterRange.min
    let maxVal = plot.chapterRange.max
    if (plot.children.length > 0) {
      for (const child of plot.children) {
        recalcChapterRangeForPlot(child)
        minVal = Math.min(minVal, child.chapterRange.min)
        maxVal = Math.max(maxVal, child.chapterRange.max)
      }
      plot.chapterRange.min = minVal
      plot.chapterRange.max = maxVal
    }
  }
  
  function recalcAllChapterRanges() {
    for (const plot of plots) {
      recalcChapterRangeForPlot(plot)
    }
  }
  
  /* ---------- Plot Checker Functionality ---------- */
  const showPlotCheckerModal = ref(false)
  const plotCheckerSearch = ref('')
  const selectedPlots = ref([])
  
  function flattenPlots(plotList) {
    let all = []
    for (const plot of plotList) {
      all.push(plot)
      if (plot.children && plot.children.length > 0) {
        all = all.concat(flattenPlots(plot.children))
      }
    }
    return all
  }
  
  const filteredPlots = computed(() => {
    const query = plotCheckerSearch.value.toLowerCase()
    const allPlots = flattenPlots(plots)
    return query ? allPlots.filter(plot => plot.title.toLowerCase().includes(query)) : allPlots
  })
  
  function isAncestorDisabled(candidate) {
    return selectedPlots.value.some(selected => {
      const chain = findAncestryChain(plots, selected.id)
      return chain && chain.some(item => item.id === candidate.id && item.id !== selected.id)
    })
  }
  
  function addPlotToSelection(plot) {
    if (selectedPlots.value.some(s => s.id === plot.id)) return
    const ancestry = findAncestryChain(plots, plot.id)
    if (ancestry) {
      ancestry.slice(0, ancestry.length - 1).forEach(anc => {
        if (selectedPlots.value.some(s => s.id === anc.id)) {
          removePlotFromSelection(anc.id)
        }
      })
    }
    if (!isAncestorDisabled(plot)) {
      selectedPlots.value.push(plot)
    }
  }
  
  function removePlotFromSelection(plotId) {
    selectedPlots.value = selectedPlots.value.filter(p => p.id !== plotId)
  }
  
  function findAncestryChain(tree, targetId) {
    for (const node of tree) {
      if (node.id === targetId) return [node]
      if (node.children && node.children.length > 0) {
        const childChain = findAncestryChain(node.children, targetId)
        if (childChain) {
          return [node, ...childChain]
        }
      }
    }
    return null
  }
  
  /* ---------- Helper: Get Content for AI ---------- */
  function getContent() {
    const text = props.editor.getContent({ format: 'text' })
    return text
  }
  
  /* ---------- Markdown Report Modal Functionality ---------- */
  const showReportModal = ref(false)
  const reportMarkdown = ref('')
  
  function closeReportModal() {
    showReportModal.value = false
  }
  
  /* ---------- Past Reports List ---------- */
  const reports = ref([])
  
  function viewPastReport(report) {
    reportMarkdown.value = report.report
    showReportModal.value = true
  }
  
  function deletePastReport(reportId) {
    reports.value = reports.value.filter(r => r.id !== reportId)
  }
  
  /* ---------- Check Plotholes and Build Markdown Report ---------- */
  const isChecking = ref(false)
  async function checkPlotholes() {
    isChecking.value = true
    const chains = []
    for (const sel of selectedPlots.value) {
      const chain = findAncestryChain(plots, sel.id)
      if (chain) {
        const annotatedChain = chain.map((plot, index) => {
          let role = ''
          if (index === 0) {
            role = 'root plot'
          } else if (index === chain.length - 1) {
            role = 'descendant to check'
          } else {
            role = 'child plot'
          }
          return {
            level: index,
            role,
            title: plot.title,
            summary: plot.summary,
            checkFocus: index === chain.length - 1
          }
        })
        chains.push(annotatedChain)
      }
    }
    const uniqueRoots = new Set(chains.map(chain => chain[0].title))
    const output = {
      plotChains: chains,
      connectionHint:
        uniqueRoots.size > 1
          ? 'Multiple root plots are connected in the overall narrative.'
          : 'Single narrative chain.',
      "main-content": getContent()
    }
  
    let apiReport = ""
    try {
      apiReport = await $fetch("${API}plot/plotholes", {
        method: "POST",
        body: output
      })
    } catch (error) {
      apiReport = "Error calling API: " + error.message
    }
  
    let markdownReport = "## Main Report\t\t\t\n\n"
    markdownReport += apiReport.result + "\n\n"
    markdownReport += "## Connections\n"
    markdownReport += output.connectionHint + "\n\n"
  
    let htmlReport = await marked(markdownReport)
    reports.value.push({
      id: uuidv4(),
      date: new Date().toLocaleString(),
      report: htmlReport
    })
    reportMarkdown.value = htmlReport
    showReportModal.value = true
    isChecking.value = false
  }
  
  function openPlotChecker() {
    plotCheckerSearch.value = ''
    showPlotCheckerModal.value = true
  }
  
  function closePlotChecker() {
    showPlotCheckerModal.value = false
  }
  
  /* ---------- Import / Export Functionality ---------- */
  const fileInput = ref(null)
  
  function triggerFileInput() {
    fileInput.value && fileInput.value.click()
  }
  
  function handleFileUpload(event) {
    const file = event.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const importedData = JSON.parse(e.target.result)
        if (Array.isArray(importedData)) {
          plots.splice(0, plots.length, ...importedData)
        } else {
          console.error("Invalid JSON format: expected an array of plots.")
        }
      } catch (err) {
        console.error("Error parsing JSON:", err)
      }
    }
    reader.readAsText(file)
  }
  
  function exportPlots() {
    const dataStr = JSON.stringify(plots, null, 2)
    const blob = new Blob([dataStr], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const link = document.createElement("a")
    link.href = url
    link.download = "plots.json"
    link.click()
    URL.revokeObjectURL(url)
  }
  </script>
  
  <style scoped>
  /* Spinner keyframes for customized spinner style */
  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
  .animate-spin {
    animation: spin 1s linear infinite;
  }
  </style>
  