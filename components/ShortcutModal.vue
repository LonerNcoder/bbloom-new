<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onUnmounted } from 'vue'

// Types
interface GroupChild {
  id: string
  name: string
  [key: string]: any
}

interface Group {
  id: string
  title: string
  shortcut: string
  icon?: string
  children: GroupChild[]
  expanded?: boolean
  matchedChildren?: GroupChild[]
  matchPriority?: number
}

const enum MatchPriority {
  EXACT_SHORTCUT = 4,
  SHORTCUT_WITH_INDEX = 3,
  CHILD_MATCH = 2,
  PARTIAL_MATCH = 1
}

// Props
interface Props {
  groups: Group[]
  posX: number
  posY: number
  visible: boolean
  search: string
}

const props = withDefaults(defineProps<Props>(), {
  search: '',
  visible: false
})

// Emits
const emit = defineEmits<{
  (e: 'result', value: { group: Group, item: GroupChild }): void
  (e: 'close'): void
}>()

// Refs
const modalRef = ref<HTMLDivElement | null>(null)
const groupRefs = ref<HTMLElement[]>([])
const childRefs = ref<HTMLElement[]>([])
const modalPosition = ref({ x: props.posX, y: props.posY })
const selectedGroupIndex = ref(-1)
const selectedChildIndex = ref(-1)

// Computed: filteredGroups with automatic expansion of best match


const filteredGroups = computed<Group[]>(() => {
  const searchTerm = props.search.toLowerCase().trim()
  
  if (!searchTerm) {
    return props.groups.map(group => ({
      ...group,
      expanded: false,
      matchedChildren: [],
      matchPriority: 0
    }))
  }

  return props.groups
    .map(group => {
      const result = { ...group }
      result.matchedChildren = []
      result.expanded = false
      result.matchPriority = 0

      // Exact shortcut match
      if (group.shortcut.toLowerCase() === searchTerm) {
        result.matchPriority = MatchPriority.EXACT_SHORTCUT
        result.expanded = true
        result.matchedChildren = [...group.children]
        return result
      }

      // Shortcut with index match
      const shortcutPattern = new RegExp(`^${group.shortcut.toLowerCase()}`, 'i')
      if (shortcutPattern.test(searchTerm)) {
        const childIndexMatch = searchTerm.replace(group.shortcut.toLowerCase(), '')
        if (/^\d+$/.test(childIndexMatch)) {
          const childIndex = parseInt(childIndexMatch) - 1
          if (childIndex >= 0 && childIndex < group.children.length) {
            result.matchPriority = MatchPriority.SHORTCUT_WITH_INDEX
            result.expanded = true
            result.matchedChildren = [group.children[childIndex]]
            return result
          }
        }
        result.matchPriority = MatchPriority.SHORTCUT_WITH_INDEX
        result.expanded = true
        result.matchedChildren = [...group.children]
        return result
      }

      // Child name match
      const childMatches = group.children.filter(child => 
        child.name.toLowerCase().includes(searchTerm)
      )
      if (childMatches.length) {
        result.matchPriority = MatchPriority.CHILD_MATCH
        result.expanded = true
        result.matchedChildren = childMatches
        return result
      }

      // Partial title or shortcut match
      if (
        group.title.toLowerCase().includes(searchTerm) || 
        group.shortcut.toLowerCase().includes(searchTerm)
      ) {
        result.matchPriority = MatchPriority.PARTIAL_MATCH
        result.expanded = true
        result.matchedChildren = [...group.children]
        return result
      }

      return result
    })
    .filter(group => group.matchPriority > 2)
    .sort((a, b) => (b.matchPriority ?? 0) - (a.matchPriority ?? 0))
})

// Focus management
const focusBestMatch = () => {
  nextTick(() => {
    const groups = filteredGroups.value
    if (!groups.length) return

    // Focus the first group's first child if expanded, otherwise focus the group
    const firstGroup = groups[0]
    selectedGroupIndex.value = 0
    
    if (firstGroup.expanded && firstGroup.matchedChildren?.length) {
      selectedChildIndex.value = 0
      const firstChildRef = childRefs.value[0]
      firstChildRef?.focus()
    } else {
      selectedChildIndex.value = -1
      const firstGroupRef = groupRefs.value[0]
      firstGroupRef?.focus()
    }
  })
}

// Key handlers
const handleListKeyDown = (event: KeyboardEvent) => {
  const groups = filteredGroups.value
  
  if (event.key === 'Escape') {
    closeModal()
    return
  }

  if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter'].includes(event.key)) {
    event.preventDefault()
    
    switch(event.key) {
      case 'ArrowDown': {
        if (selectedGroupIndex.value === groups.length - 1 && 
            (selectedChildIndex.value === -1 || 
             selectedChildIndex.value === groups[selectedGroupIndex.value].matchedChildren?.length! - 1)) {
          selectedGroupIndex.value = 0
          selectedChildIndex.value = -1
        } else {
          const currentGroup = groups[selectedGroupIndex.value]
          if (selectedChildIndex.value === -1) {
            if (currentGroup.expanded && currentGroup.matchedChildren?.length) {
              selectedChildIndex.value = 0
            } else if (selectedGroupIndex.value < groups.length - 1) {
              selectedGroupIndex.value++
            }
          } else {
            if (currentGroup.matchedChildren && selectedChildIndex.value < currentGroup.matchedChildren.length - 1) {
              selectedChildIndex.value++
            } else if (selectedGroupIndex.value < groups.length - 1) {
              selectedGroupIndex.value++
              selectedChildIndex.value = -1
            }
          }
        }
        break
      }
      case 'ArrowUp': {
        if (selectedGroupIndex.value === 0 && selectedChildIndex.value === -1) {
          selectedGroupIndex.value = groups.length - 1
          const lastGroup = groups[groups.length - 1]
          if (lastGroup.expanded && lastGroup.matchedChildren?.length) {
            selectedChildIndex.value = lastGroup.matchedChildren.length - 1
          }
        } else {
          const currentGroup = groups[selectedGroupIndex.value]
          if (selectedChildIndex.value > 0) {
            selectedChildIndex.value--
          } else if (selectedChildIndex.value === 0) {
            selectedChildIndex.value = -1
          } else if (selectedGroupIndex.value > 0) {
            selectedGroupIndex.value--
            const prevGroup = groups[selectedGroupIndex.value]
            if (prevGroup.expanded && prevGroup.matchedChildren?.length) {
              selectedChildIndex.value = prevGroup.matchedChildren.length - 1
            }
          }
        }
        break
      }
      case 'ArrowLeft': {
        if (selectedGroupIndex.value !== -1) {
          const group = groups[selectedGroupIndex.value]
          if (selectedChildIndex.value !== -1) {
            selectedChildIndex.value = -1
          } else if (group.expanded) {
            group.expanded = false
          }
        }
        break
      }
      case 'ArrowRight': {
        if (selectedGroupIndex.value !== -1) {
          const group = groups[selectedGroupIndex.value]
          if (!group.expanded && group.children?.length) {
            group.expanded = true
            group.matchedChildren = [...group.children]
            selectedChildIndex.value = 0
          }
        }
        break
      }
      case 'Enter': {
        if (selectedGroupIndex.value !== -1) {
          const group = groups[selectedGroupIndex.value]
          if (group.matchedChildren?.length && selectedChildIndex.value !== -1) {
            selectItem(group.matchedChildren[selectedChildIndex.value], group)
          } else if (!group.expanded && group.children?.length) {
            group.expanded = true
            group.matchedChildren = [...group.children]
            selectedChildIndex.value = 0
          }
        }
        break
      }
    }
    nextTick(() => {
      if (selectedChildIndex.value !== -1) {
        const totalChildrenBefore = filteredGroups.value
          .slice(0, selectedGroupIndex.value)
          .reduce((sum, group) => sum + (group.matchedChildren?.length || 0), 0)
        const targetIndex = totalChildrenBefore + selectedChildIndex.value
        childRefs.value[targetIndex]?.focus()
      } else {
        groupRefs.value[selectedGroupIndex.value]?.focus()
      }
    })
  }
}

// Actions
const closeModal = () => {
  emit('close')
}

const toggleGroupExpansion = (group: Group, groupIndex: number) => {
  group.expanded = !group.expanded
  selectedGroupIndex.value = groupIndex
  if (group.expanded) {
    group.matchedChildren = [...group.children]
    selectedChildIndex.value = 0
  } else {
    selectedChildIndex.value = -1
  }
  nextTick(() => {
    if (selectedChildIndex.value !== -1) {
      childRefs.value[0]?.focus()
    } else {
      groupRefs.value[selectedGroupIndex.value]?.focus()
    }
  })
}

const selectItem = (item: GroupChild, group: Group) => {
  emit('result', item)
  closeModal()
}

// Modal position
const calculateModalPosition = () => {
  if (!modalRef.value) return
  
  const modalRect = modalRef.value.getBoundingClientRect()
  const windowWidth = window.innerWidth
  const windowHeight = window.innerHeight
  
  let newX = props.posX
  let newY = props.posY
  
  newX = Math.min(newX, windowWidth - modalRect.width - 10)
  newY = Math.min(newY, windowHeight - modalRect.height - 10)
  
  modalPosition.value = { x: Math.max(10, newX), y: Math.max(10, newY) }
}

// Watchers
watch(() => props.visible, (isVisible) => {
  if (isVisible) {
    nextTick(() => {
      calculateModalPosition()
      focusBestMatch()
    })
  }
})

watch(() => props.search, () => {
  focusBestMatch()
})

// Lifecycle
onMounted(() => {
  document.addEventListener('click', handleOutsideClick)
  window.addEventListener('resize', calculateModalPosition)
})

onUnmounted(() => {
  document.removeEventListener('click', handleOutsideClick)
  window.removeEventListener('resize', calculateModalPosition)
})

// Handle outside clicks
const handleOutsideClick = (event: MouseEvent) => {
  if (props.visible && modalRef.value && !modalRef.value.contains(event.target as Node)) {
    closeModal()
  }
}

// Computed styles
const modalStyle = computed(() => ({
  left: `${modalPosition.value.x}px`,
  top: `${modalPosition.value.y}px`
}))
</script>

<template>
  <Teleport to="body">
    <div 
      v-if="visible" 
      ref="modalRef"
      class="fixed z-[99999] bg-white border rounded-lg shadow-lg overflow-hidden"
      :style="modalStyle"
      tabindex="-1"
      @keydown.esc="closeModal"
    >
      <ul class="max-h-64 overflow-y-auto">
        <template v-if="filteredGroups.length">
          <li 
            v-for="(group, groupIndex) in filteredGroups" 
            :key="group.id"
            class="group"
          >
            <div 
              ref="groupRefs"
              :tabindex="selectedGroupIndex === groupIndex && selectedChildIndex === -1 ? 0 : -1"
              :class="[
                'px-3 py-2 flex items-center hover:bg-gray-100 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500',
                { 'bg-blue-100': selectedGroupIndex === groupIndex && selectedChildIndex === -1 }
              ]"
              @click="toggleGroupExpansion(group, groupIndex)"
              @keydown="handleListKeyDown"
            >
              <span class="mr-2">{{ group.title }}</span>
              <span class="text-gray-500 text-sm">({{ group.shortcut }})</span>
            </div>
            <ul 
              v-if="group.expanded && group.matchedChildren?.length" 
              class="pl-4 bg-gray-50"
            >
              <li 
                v-for="(child, childIndex) in group.matchedChildren" 
                :key="child.id"
                ref="childRefs"
                :tabindex="selectedGroupIndex === groupIndex && selectedChildIndex === childIndex ? 0 : -1"
                @click="selectItem(child, group)"
                @keydown="handleListKeyDown"
                :class="[
                  'px-3 py-2 hover:bg-gray-200 cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500',
                  { 'bg-blue-200': selectedGroupIndex === groupIndex && selectedChildIndex === childIndex }
                ]"
              >
                {{ child.name }}
              </li>
            </ul>
          </li>
        </template>
        <li v-else class="px-3 py-2 text-gray-500">
          No matching groups found
        </li>
      </ul>
    </div>
  </Teleport>
</template>

<style scoped>
.max-h-64 {
  max-height: 16rem;
}
</style>