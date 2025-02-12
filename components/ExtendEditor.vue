<template>
  <!-- <ClientOnly> -->
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
<!-- </ClientOnly> -->
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css' // import css
import { onMounted, ref } from 'vue'
import { i18nChangeLanguage, createEditor, createToolbar } from '@wangeditor/editor'

const pageTitle = ref('')
var editor;

// const insertFn = (url, alt, src) => {
//   console.log(url, alt, src)
// }

onMounted(() => {
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
})

onBeforeUnmount(() => {
  // Destroy editor instance if necessary
  if (editor) {
    editor.destroy()
  }
})
</script>

<style scoped>
html,
body {
  background-color: #fff;
  height: 100%;
  overflow: hidden;
  color: #333;
}

#top-container {
  border-bottom: 1px solid #e8e8e8;
  padding-left: 30px;
}

#editor-toolbar {
  width: 1350px;
  background-color: #FCFCFC;
  margin: 0 auto;
}

#content {
  height: calc(100% - 40px);
  background-color: rgb(245, 245, 245);
  overflow-y: auto;
  position: relative;
}

#editor-container {
  width: 850px;
  margin: 30px auto 150px auto;
  background-color: #fff;
  padding: 20px 50px 50px 50px;
  border: 1px solid #e8e8e8;
  box-shadow: 0 2px 10px rgb(0 0 0 / 12%);
}

#title-container {
  padding: 20px 0;
  border-bottom: 1px solid #e8e8e8;
}

#title-container input {
  font-size: 30px;
  border: 0;
  outline: none;
  width: 100%;
  line-height: 1;
}

#editor-text-area {
  min-height: 900px;
  margin-top: 20px;
}
</style>