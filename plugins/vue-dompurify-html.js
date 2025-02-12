import VueDOMPurifyHTML from 'vue-dompurify-html';

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.use(VueDOMPurifyHTML, {
    // Config to sanitize HTML content
    global: {
      // Custom configuration for DOMPurify
      // Allowed the <style>, <object>, and <embed> tags, and disallow <script> and <link>
      ALLOWED_TAGS: [
        'b', 'i', 'u', 'p', 'div', 'span', 'strong', 'em', 'h1', 'h2', 'h3',
        'ul', 'ol', 'li', 'a', 'style', 'object', 'embed'
      ], // Allowed additional tags like <style>, <object>, and <embed>
      
      ALLOWED_ATTR: ['href', 'src', 'alt', 'title'], // Allowed attributes
      
      FORBID_TAGS: ['script'], // Disallow <script> tags
    },
  });
});
