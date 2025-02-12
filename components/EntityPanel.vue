<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, watch } from 'vue'
import { TreeItem, TreeRoot } from 'radix-vue'
import { Plus, Circle, Users, Package, Folder, FolderOpen, Gavel, Trash2 } from 'lucide-vue-next'

const props = defineProps({
  shortCutKeyPressed: {
    type: Boolean,
    default: false
  },
  shortCutKey: {
    type: String,
    default: ""
  },
  groups: {
    type: Array,
    required: true
  }
})
const emit = defineEmits(["result", "update-group"])


const fileInput = ref<HTMLInputElement | null>(null)

const getIconComponent = (iconName: string) => {
  const iconMap: { [key: string]: any } = {
    users: Users,
    tool: Gavel,
    package: Package,
    folder: Folder
  }
  return iconMap[iconName] || Folder
}
const groupsState = ref(props.groups)

// Helper to emit updated groups.
const emitUpdate = () => {
  console.log("updated")
  emit("update-group", groupsState.value)
}

// Auto-generate unique shortcut
const getShortcut = (groupName: string) => {
  const existingShortcuts = groupsState.value.map(g => g.shortcut)
  let shortcut = ''
  for (let i = 0; i < groupName.length; i++) {
    shortcut += groupName[i].toLowerCase()
    if (!existingShortcuts.includes(shortcut)) {
      return shortcut
    }
  }
  let counter = 1
  while (existingShortcuts.includes(shortcut + counter)) {
    counter++
  }
  return shortcut + counter
}

const addGroup = (name: string) => {
  const newGroup = {
    id: name.toLowerCase(),
    title: name,
    shortcut: getShortcut(name),
    icon: 'folder',
    children: [],
    isEditing: true,
    isEditingShortcut: false
  }
  groupsState.value.push(newGroup)
  emitUpdate()
}

const addEntity = (groupId: string, entityName: string) => {
  const group = groupsState.value.find(g => g.id === groupId)
  if (group && group.children) {
    group.children.push({
      id: `${groupId}-${Date.now()}`,
      name: entityName,
      isEditing: true
    })
    emitUpdate()
  }
}

const deleteGroup = (groupId: string) => {
  groupsState.value = groupsState.value.filter(g => g.id !== groupId)
  emitUpdate()
}

// Delete an entity by searching through all groups.
const deleteEntityById = (entityId: string) => {
  for (const group of groupsState.value) {
    if (group.children) {
      const index = group.children.findIndex(e => e.id === entityId)
      if (index > -1) {
        group.children.splice(index, 1)
        emitUpdate()
        break
      }
    }
  }
}

const startEditingGroup = (group: any) => {
  groupsState.value.forEach(g => {
    g.isEditing = false
    g.isEditingShortcut = false
    g.children?.forEach((e: any) => (e.isEditing = false))
  })
  group.isEditing = true
}

const startEditingShortcut = (group: any) => {
  groupsState.value.forEach(g => {
    g.isEditing = false
    g.isEditingShortcut = false
    g.children?.forEach((e: any) => (e.isEditing = false))
  })
  group.isEditingShortcut = true
}

const startEditingEntity = (entity: any) => {
  groupsState.value.forEach(g => {
    g.isEditing = false
    g.isEditingShortcut = false
    g.children?.forEach((e: any) => (e.isEditing = false))
  })
  entity.isEditing = true
}

const saveGroupEdit = (group: any, newValue: string) => {
  if (newValue.trim()) {
    group.title = newValue.trim()
  }
  group.isEditing = false
  emitUpdate()
}

const saveShortcutEdit = (group: any, newValue: string) => {
  const trimmedValue = newValue.trim().toLowerCase()
  if (trimmedValue && trimmedValue.length > 0 && !isShortcutTaken(trimmedValue, group.id)) {
    group.shortcut = trimmedValue
  }
  group.isEditingShortcut = false
  emitUpdate()
}

const isShortcutTaken = (shortcut: string, currentGroupId: string) => {
  return groupsState.value.some(g => g.shortcut === shortcut && g.id !== currentGroupId)
}

const saveEntityEdit = (entity: any, newValue: string) => {
  if (newValue.trim()) {
    entity.name = newValue.trim()
  }
  entity.isEditing = false
  emitUpdate()
}

const handleEditKeydown = (e: KeyboardEvent, saveFn: Function) => {
  if (e.key === 'Enter') {
    saveFn()
  }
}

const returnResult = (res: string) => {
  emit("result", res)
  return
}

const handleKeyDown = (e: KeyboardEvent) => {
  const activeElement = document.activeElement as HTMLElement
  if (activeElement && (activeElement.tagName === 'INPUT' || activeElement.tagName === 'TEXTAREA')) {
    e.stopPropagation()
  }
}

onMounted(() => {
  window.addEventListener('keydown', handleKeyDown, true)
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', handleKeyDown, true)
})

const vFocus = {
  mounted: (el: HTMLElement) => el.focus()
}

// Export groups to JSON file
const exportToJson = () => {
  const jsonStr = JSON.stringify(groupsState.value, null, 2)
  const blob = new Blob([jsonStr], { type: "application/json" })
  const url = URL.createObjectURL(blob)
  const a = document.createElement("a")
  a.href = url
  a.download = "groups.json"
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

// Import groups from JSON file
const importFromJson = (e: Event) => {
  const input = e.target as HTMLInputElement
  if (input.files && input.files[0]) {
    const file = input.files[0]
    const reader = new FileReader()
    reader.onload = (e) => {
      try {
        const json = JSON.parse(e.target?.result as string)
        groupsState.value = json
        emitUpdate()
      } catch (err) {
        console.error("Invalid JSON file", err)
      }
    }
    reader.readAsText(file)
  }
}

// Optional: Watch for external prop changes and update local state.
watch(
  () => props.groups,
  (newVal) => {
    if (Array.isArray(newVal)) {
      groupsState.value = newVal
    }
  }
)
</script>

<template>
  <div class="p-4">
    <div class="bg-white rounded-lg shadow">
      <div class="p-4">
        <h3 class="font-semibold mb-4">Entities</h3>
        <TreeRoot
          v-slot="{ flattenItems }"
          class="list-none select-none w-full text-gray-900 text-sm"
          :items="groupsState"
          :get-key="(item) => item.id"
        >
          <TreeItem
            v-for="item in flattenItems"
            v-slot="{ isExpanded }"
            :key="item._id"
            :style="{ 'padding-left': `${item.level}rem` }"
            v-bind="item.bind"
            class="flex items-center py-2 px-2 my-0.5 rounded-md hover:bg-gray-50 outline-none focus:ring-2 focus:ring-blue-500"
          >
            <div class="flex items-center justify-between w-full">
              <div class="flex items-center gap-2">
                <template v-if="item.hasChildren">
                  <component :is="isExpanded ? FolderOpen : Folder" class="h-4 w-4" />
                  <input
                    v-if="item.value.isEditing"
                    type="text"
                    :value="item.value.title"
                    class="px-1 py-0.5 border rounded text-sm"
                    @blur="saveGroupEdit(item.value, $event.target.value)"
                    @keydown="(e) => handleEditKeydown(e, () => saveGroupEdit(item.value, (e.target as HTMLInputElement).value))"
                    v-focus
                  />
                  <span
                    v-else
                    class="cursor-pointer"
                    @dblclick.stop="startEditingGroup(item.value)"
                  >
                    {{ item.value.title }}
                  </span>
                  <input
                    v-if="item.value.isEditingShortcut"
                    type="text"
                    :value="item.value.shortcut"
                    class="px-1 py-0.5 border rounded text-sm w-6 text-center"
                    @blur="saveShortcutEdit(item.value, $event.target.value)"
                    @keydown="(e) => handleEditKeydown(e, () => saveShortcutEdit(item.value, (e.target as HTMLInputElement).value))"
                    maxlength="5"
                    v-focus
                  />
                  <span
                    v-else
                    class="ml-2 text-xs text-gray-500 cursor-pointer"
                    @dblclick.stop="startEditingShortcut(item.value)"
                  >
                    [{{ item.value.shortcut }}]
                  </span>
                </template>
                <template v-else>
                  <Circle class="h-4 w-4" />
                  <input
                    v-if="item.value.isEditing"
                    type="text"
                    :value="item.value.name"
                    class="px-1 py-0.5 border rounded text-sm"
                    @blur="saveEntityEdit(item.value, $event.target.value)"
                    @keydown="(e) => handleEditKeydown(e, () => saveEntityEdit(item.value, (e.target as HTMLInputElement).value))"
                    v-focus
                  />
                  <span
                    v-else
                    class="cursor-pointer"
                    @dblclick.stop="startEditingEntity(item.value)"
                  >
                    {{ item.value.name }}
                  </span>
                </template>
              </div>
              <div class="flex items-center gap-1">
                <!-- For groups: add entity and delete group -->
                <template v-if="item.hasChildren">
                  <button
                    class="p-1 hover:bg-gray-100 rounded-md"
                    @click.stop="() => addEntity(item.value.id, 'New Entity')"
                  >
                    <Plus class="w-4 h-4" />
                  </button>
                  <button
                    class="p-1 hover:bg-red-100 rounded-md"
                    @click.stop="() => deleteGroup(item.value.id)"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </template>
                <!-- For entities: use deleteEntityById -->
                <template v-else>
                  <button
                    class="p-1 hover:bg-red-100 rounded-md"
                    @click.stop="() => deleteEntityById(item.value.id)"
                  >
                    <Trash2 class="w-4 h-4" />
                  </button>
                </template>
              </div>
            </div>
          </TreeItem>
        </TreeRoot>
      </div>
    </div>
    <!-- Bottom buttons: Add Group, Export and Import -->
    <div class="mt-4 flex flex-col gap-2">
      <button
        class="w-full px-4 py-2 text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 rounded-md flex items-center justify-center gap-2"
        @click="() => addGroup('New Group')"
      >
        <Plus class="w-4 h-4" />
        Add Group
      </button>
      <button
        class="w-full px-4 py-2 text-sm bg-green-50 hover:bg-green-100 text-green-600 rounded-md flex items-center justify-center gap-2"
        @click="exportToJson"
      >
        <Plus class="w-4 h-4" />
        Export JSON
      </button>
      <button
        class="w-full px-4 py-2 text-sm bg-yellow-50 hover:bg-yellow-100 text-yellow-600 rounded-md flex items-center justify-center gap-2"
        @click="() => fileInput && fileInput.click()"
      >
        <Plus class="w-4 h-4" />
        Import JSON
      </button>
      <!-- Hidden file input for importing JSON -->
      <input type="file" ref="fileInput" style="display:none" accept=".json" @change="importFromJson" />
    </div>
  </div>
</template>
