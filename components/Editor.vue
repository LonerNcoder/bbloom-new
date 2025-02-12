<template>
    <textarea id="txttinyeditor"></textarea>
</template>

<script setup>
import { onMounted } from 'vue'
useHead({
  title: "Editing Chapters",
  script:[ 
      {
        src: 'https://cdnjs.cloudflare.com/ajax/libs/tinymce/5.10.9/tinymce.min.js',
        defer: true,
        async: true,
        onload: () => {
          tinymce.init({
          selector: '#txttinyeditor',

          // plugins: [
          //   'advlist', 'anchor', 'autolink', 'autoresize', 'autosave', 'charmap', 'code', 'codesample',
          //   'directionality', 'emoticons', 'fullscreen', 'image', 'insertdatetime', 'link', 'lists',
          //   'media', 'nonbreaking', 'pagebreak', 'preview', 'quickbars', 'searchreplace', 'table',
          //   'visualblocks', 'visualchars', 'wordcount'
          // ],
          // plugins: ["quickbars image advlist lists link media table codesample code fullscreen preview template math emoticons searchreplace wordcount searchreplace"],
          plugins: "advlist anchor autolink autosave charmap code codesample directionality emoticons fullpage fullscreen help image imagetools insertdatetime link lists media nonbreaking noneditable pagebreak paste preview print quickbars save searchreplace spellchecker tabfocus table template textpattern toc visualblocks visualchars wordcount",
          toolbar: 'undo redo | formatselect fontselect fontsizeselect | bold italic underline | forecolor backcolor customformatpainter | formats |  link image media | alignleft aligncenter alignright alignjustify | lineheight checklist bullist numlist | preview fullscreen | indent outdent | floatleft floatright',
          toolbar_mode: 'floating',
          toolbar_sticky: true,
          quickbars_insert_toolbar: 'quicktable align image media codesample',
          quickbars_selection_toolbar: 'bold italic underline | align fontsizeselect | bullist numlist | blockquote quicklink',
          contextmenu: 'undo redo | inserttable | cell row column deletetable | help',
          // icons: 'thin',
          menubar: true,
          image_advtab: true,
          fontsize_formats: "8pt 10pt 11pt 12pt 14pt 16pt 18pt 20pt 22pt 24pt 36pt",
          branding: false,
          height: '700px',
          content_css: "document",
          setup: async function (editor) {
                let selectedColor = '#ffffff';
                editor.on('init', async function () {
                  const cleanedHtml = await removeStyles(props.content)
                  editor.setContent(cleanedHtml)
                  selectedColor = editor.getBody().style.backgroundColor || '#ffffff';
                  activeEditor.value = editor;
                });
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
                        
                        // Apply to body tag
                        editor.dom.setStyles(editor.getBody(), {
                          'background-color': color
                        });
                        document.getElementsByClassName("paint-icon-rect")[0].setAttribute("fill",color)
                        api.close();
                      }
                    });
                  }
                });
          },
        })}}]})

</script>
