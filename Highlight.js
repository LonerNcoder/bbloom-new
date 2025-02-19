
// TextHighlighter.js - A lightweight library for persistent text highlighting
class TextHighlighter {
    constructor(options = {}) {
      this.options = {
        colors: ['#ffeb3b', '#4caf50', '#03a9f4', '#e91e63'],
        containerClass: 'text-highlighter',
        storageKey: 'text-highlights',
        ...options
      };

      this.highlights = this.loadHighlights();
      this.activeSelection = null;
      this.highlightModal = null;
      this.editModal = null; // For editing existing highlights

      this.init();
    }

    init() {
      // Initialize highlight modal (combined color and note)
      this.createHighlightModal();

      // Setup event listeners
      document.addEventListener('mouseup', this.handleSelection.bind(this));
      document.addEventListener('click', this.handleHighlightClick.bind(this));

      // Render existing highlights
      this.renderHighlights();
    }

    createHighlightModal() {
      this.highlightModal = document.createElement('div');
      this.highlightModal.className = `${this.options.containerClass}-modal`; // Reusing modal class for combined modal
      this.highlightModal.style.cssText = `
        position: fixed;
        display: none;
        background: white;
        border-radius: 8px;
        box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        padding: 15px; /* Increased padding for modal */
        z-index: 1000;
        transition: all 0.2s ease;
        min-width: 250px; /* Minimum width for modal */
      `;

      // Color buttons
      const colorContainer = document.createElement('div');
      colorContainer.style.display = 'flex';
      colorContainer.style.gap = '8px';
      colorContainer.style.marginBottom = '10px'; // Space between colors and textarea

      this.options.colors.forEach(color => {
        const button = document.createElement('button');
        button.className = `${this.options.containerClass}-color-btn`;
        button.style.cssText = `
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: none;
          background: ${color};
          cursor: pointer;
          transition: transform 0.2s ease;
        `;
        button.addEventListener('click', () => this.highlightSelection(color));
        colorContainer.appendChild(button);
      });

      // Note textarea
      const textarea = document.createElement('textarea');
      textarea.className = `${this.options.containerClass}-note-input`;
      textarea.placeholder = 'Add a note...';
      textarea.style.cssText = `
        width: 95%;
        height: 16px;
        padding: 8px;
        border: 1px solid #ddd;
        border-radius: 4px;
        resize: vertical; /* Allow vertical resizing */
      `;

      this.highlightModal.appendChild(colorContainer);
      this.highlightModal.appendChild(textarea);
      document.body.appendChild(this.highlightModal);
    }


    handleSelection(event) { // Add event parameter
        const selection = window.getSelection();
        if (!selection.toString().trim()) {
          // Check if the click is inside the highlightModal before hiding it
          if (this.highlightModal && this.highlightModal.contains(event.target)) {
            return; // Do nothing if click is inside the modal
          }
          this.hideHighlightModal();
          return;
        }

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();
        this.activeSelection = {
          range,
          text: selection.toString()
        };

        this.showHighlightModal(rect);
      }

    showHighlightModal(rect) {
      const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
      this.highlightModal.style.display = 'block';
      this.highlightModal.style.top = `${rect.top + scrollTop - this.highlightModal.offsetHeight - 10}px`;
      this.highlightModal.style.left = `${rect.left + (rect.width - this.highlightModal.offsetWidth) / 2}px`;

      // Clear textarea when showing modal for new selection
      const textarea = this.highlightModal.querySelector(`.${this.options.containerClass}-note-input`);
      if (textarea) {
        textarea.value = '';
      }
    }

    hideHighlightModal() {
      this.highlightModal.style.display = 'none';
      this.activeSelection = null;
    }

    highlightSelection(color) {
      if (!this.activeSelection) return;

      const noteTextarea = this.highlightModal.querySelector(`.${this.options.containerClass}-note-input`);
      const note = noteTextarea ? noteTextarea.value : '';


      const highlight = {
        id: Date.now().toString(),
        color,
        text: this.activeSelection.text,
        note: note,
        range: this.serializeRange(this.activeSelection.range)
      };

      this.highlights.push(highlight);
      this.saveHighlights();
      this.renderHighlight(highlight);
      this.hideHighlightModal();
    }


    handleHighlightClick(event) {
      const highlightEl = event.target.closest(`.${this.options.containerClass}-highlight`);
      if (!highlightEl) return;

      const highlight = this.highlights.find(h => h.id === highlightEl.dataset.id);
      if (!highlight) return;

      this.showEditHighlightModal(highlight, highlightEl); // Renamed function
    }


    showEditHighlightModal(highlight, element) { // Renamed function and using editModal
        let overlay = document.querySelector(`.${this.options.containerClass}-modal-overlay`);
        let updateIcon, deleteIcon; // Declare updateIcon and deleteIcon once using let
        if (!this.editModal) {
            this.editModal = document.createElement('div');
            this.editModal.className = `${this.options.containerClass}-modal`;
            this.editModal.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 2px 20px rgba(0,0,0,0.2);
            z-index: 1001;
            min-width: 300px;
          `;

          // Header for modal - title on left, icons on right
          const modalHeader = document.createElement('div');
          modalHeader.style.cssText = `
            display: flex;
            justify-content: space-between; /* Space between title and icons */
            align-items: center; /* Vertically align title and icons */
            margin-bottom: 10px;
          `;

          // Title "Highlight Note"
          const modalTitle = document.createElement('h3');
          modalTitle.textContent = 'Highlight Note';
          modalTitle.style.cssText = `
            margin: 0; /* Remove default margin for h3 */
            font-size: 1.2em; /* Adjust font size as needed */
          `;
          modalHeader.appendChild(modalTitle);


          // Icons Container (for delete and update icons) - CREATE ICONS CONTAINER HERE FIRST
          const iconsContainer = document.createElement('div'); // Create iconsContainer FIRST
          iconsContainer.style.cssText = `
            display: flex;
            gap: 8px; /* Space between icons */
          `;

          // Delete Icon
          const deleteIconElement = document.createElement('button'); // Use a different variable name temporarily
          deleteIconElement.innerHTML = '❌';
          deleteIconElement.className = `${this.options.containerClass}-delete-btn`;
          deleteIconElement.style.cssText = `
            border: none;
            background: none;
            cursor: pointer;
            font-size: 18px;
          `;
          iconsContainer.appendChild(deleteIconElement); // Append delete icon to iconsContainer

          // Update Icon (Edit)
          const updateIconElement = document.createElement('button'); // Use a different variable name temporarily
          updateIconElement.innerHTML = '✔';
          updateIconElement.className = `${this.options.containerClass}-update-btn`;
          updateIconElement.style.cssText = `
            border: none;
            background: none;
            cursor: pointer;
            font-size: 18px;
          `;
          iconsContainer.appendChild(updateIconElement); // Append update icon to iconsContainer

          modalHeader.appendChild(iconsContainer); // Append icons container to header
          this.editModal.appendChild(modalHeader);


          // NOW, after iconsContainer is created and appended, assign to function-scoped variables
          updateIcon = updateIconElement; // Assign to the function-scoped updateIcon variable
          deleteIcon = deleteIconElement; // Assign to the function-scoped deleteIcon variable


          const noteText = document.createElement('textarea');
          noteText.className = `${this.options.containerClass}-edit-note-text`;
          noteText.style.cssText = `
            width: 95%;
            min-height: 100px;
            margin: 10px 0;
            padding: 8px;
            border: 1px solid #ddd;
            border-radius: 4px;
          `;
          this.editModal.appendChild(noteText);


          overlay = document.createElement('div');
          overlay.className = `${this.options.containerClass}-modal-overlay`;
          overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: rgba(0,0,0,0.5);
            z-index: 1000;
          `;
          overlay.addEventListener('click', () => this.removeEditModal(this.editModal, overlay));

          document.body.appendChild(overlay);
          document.body.appendChild(this.editModal);
        } else {
            // Re-get icons if modal already exists (important for re-attaching listeners)
            const iconsContainer = this.editModal.querySelector('div'); // Assuming iconsContainer is in modalHeader
            updateIcon = iconsContainer.querySelector(`.${this.options.containerClass}-update-btn`);
            deleteIcon = iconsContainer.querySelector(`.${this.options.containerClass}-delete-btn`);
            overlay = document.querySelector(`.${this.options.containerClass}-modal-overlay`);

        }

        // **Crucially, attach event listeners HERE, outside the if block, every time modal is shown:**
        // No need to re-query icons again, use the function-scoped updateIcon and deleteIcon

        // Remove any existing event listeners (important before adding new ones) - Optional, but good practice
        const newUpdateIcon = updateIcon.cloneNode(true);
        const newDeleteIcon = deleteIcon.cloneNode(true);
        updateIcon.parentNode.replaceChild(newUpdateIcon, updateIcon);
        deleteIcon.parentNode.replaceChild(newDeleteIcon, deleteIcon);
        const updateIconFresh = this.editModal.querySelector(`.${this.options.containerClass}-update-btn`);
        const deleteIconFresh = this.editModal.querySelector(`.${this.options.containerClass}-delete-btn`);


        updateIconFresh.addEventListener('click', () => { // Use fresh icons
          const noteTextElement = this.editModal.querySelector(`.${this.options.containerClass}-edit-note-text`);
          if(noteTextElement) {
            highlight.note = noteTextElement.value;
            this.saveHighlights();
            this.removeEditModal(this.editModal, overlay);
          }
        });

        deleteIconFresh.addEventListener('click', () => { // Use fresh icons
          console.log(highlight); // Should now log the *correct* highlight
          try {
            this.highlights = this.highlights.filter(h => h.id !== highlight.id);
            this.saveHighlights();
              // Defer re-rendering using setTimeout
              setTimeout(() => {
                  this.renderHighlights();
              }, 0); // 0ms delay, but still defers execution to the next event loop

          } catch (error) {
            console.warn('Failed to render highlight:', error);
          }

          this.removeEditModal(this.editModal, overlay);
        });


        // Update modal content for the specific highlight
        const noteTextElement = this.editModal.querySelector(`.${this.options.containerClass}-edit-note-text`);
        if(noteTextElement) {
          noteTextElement.value = highlight.note;
        }

        this.editModal.style.display = 'block'; // Show the modal
        // const overlay = document.querySelector(`.${this.options.containerClass}-modal-overlay`); // Get existing overlay - already defined above
        if (overlay) overlay.style.display = 'block'; // Ensure overlay is visible
      }


    removeEditModal(modal, overlay) {
      if (modal) modal.style.display = 'none';
      if (overlay) overlay.style.display = 'none';
      //remove the event listeners from the modal
    }


    serializeRange(range) {
      const startContainer = this.getNodePath(range.startContainer);
      const endContainer = this.getNodePath(range.endContainer);
      return {
        startContainer,
        startOffset: range.startOffset,
        endContainer,
        endOffset: range.endOffset
      };
    }

    deserializeRange(serialized) {
      const startContainer = this.getNodeFromPath(serialized.startContainer);
      const endContainer = this.getNodeFromPath(serialized.endContainer);

      if (!startContainer || !endContainer) {
        console.warn("Failed to deserialize range due to missing node. This might happen if the DOM structure changed significantly after highlighting.");
        return null; // Or handle error appropriately, maybe remove the highlight from storage
      }

      try {
        const range = document.createRange();
        range.setStart(startContainer, serialized.startOffset);
        range.setEnd(endContainer, serialized.endOffset);
        return range;
      } catch (error) {
        console.warn("Error creating range from deserialized data:", error);
        return null; // Handle range creation error
      }
    }

    getNodePath(node) {
      if (!node) return null; // Handle case where node is null or undefined

      const path = [];
      while (node !== document.body) {
        if (!node.parentNode) return null; // Node is detached from document.body

        let index = 0;
        let sibling = node;
        while (sibling.previousSibling) {
          sibling = sibling.previousSibling;
          index++;
        }
        path.unshift(index);
        node = node.parentNode;
      }
      return path;
    }

    getNodeFromPath(path) {
      if (!path) return null;
      let node = document.body;
      for (const index of path) {
        if (!node.childNodes || !node.childNodes[index]) {
          return null; // Path is invalid, node doesn't exist at this path
        }
        node = node.childNodes[index];
      }
      return node;
    }


    renderHighlight(highlight) {
      const range = this.deserializeRange(highlight.range);
      if (!range) {
        // Range deserialization failed, remove highlight from data
        this.highlights = this.highlights.filter(h => h.id !== highlight.id);
        this.saveHighlights();
        return; // Skip rendering this highlight
      }

      const span = document.createElement('span');
      span.className = `${this.options.containerClass}-highlight`;
      span.dataset.id = highlight.id;
      span.style.backgroundColor = highlight.color;
      span.style.cursor = 'pointer';
      span.style.position = 'relative'; // Required for absolute positioning of the note bubble

      // Create note bubble
      const noteBubble = document.createElement('div');
      noteBubble.className = `${this.options.containerClass}-note-bubble`;
      noteBubble.textContent = highlight.note;
      noteBubble.style.cssText = `
        position: relative;
        display: none; /* Hidden by default */
        background-color: white;
        color: black;
        padding: 8px;
        border-radius: 4px;
        box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        z-index: 1001;
        bottom: 120%; /* Position above the highlight */
        left: 50%;
        transform: translateX(-50%);
        white-space: nowrap;
      `;
      span.appendChild(noteBubble);


      // Add hover event listeners to show/hide note bubble
      span.addEventListener('mouseover', () => {
        console.log("mouseover");
        noteBubble.style.display = 'block';
      });
      span.addEventListener('mouseout', () => {
        console.log("mouseout");
        noteBubble.style.display = 'none';
      });


      try {
        range.surroundContents(span);
      } catch (error) {
        console.warn("Error surrounding content with highlight span:", error);
        // Handle error, possibly by removing the highlight data as it cannot be rendered
        this.highlights = this.highlights.filter(h => h.id !== highlight.id);
        this.saveHighlights();
      }
    }


    renderHighlights() {
        // 1. Clear existing highlights from the DOM
        const existingHighlights = document.querySelectorAll(`.${this.options.containerClass}-highlight`);
        existingHighlights.forEach(highlightElement => {
          if (highlightElement.parentNode) {
            highlightElement.outerHTML = highlightElement.textContent; // Replace span with its text
          }
        });

        // 2. Render the current set of highlights
        this.highlights.forEach(highlight => {
          try {
            this.renderHighlight(highlight);
          } catch (error) {
            console.warn('Failed to render highlight:', error);
          }
        });
      }

    loadHighlights() {
      const stored = localStorage.getItem(this.options.storageKey);
      return stored ? JSON.parse(stored) : [];
    }

    saveHighlights() {
      localStorage.setItem(this.options.storageKey, JSON.stringify(this.highlights));
    }

    // Public API methods
    getHighlights() {
      return [...this.highlights];
    }

    removeAllHighlights() {
      this.highlights = [];
      this.saveHighlights();
      location.reload();
    }

    exportHighlights() {
      return JSON.stringify(this.highlights);
    }

    importHighlights(highlightsJson) {
      try {
        const imported = JSON.parse(highlightsJson);
        this.highlights = imported;
        this.saveHighlights();
        this.renderHighlights();
        return true;
      } catch (error) {
        console.error('Failed to import highlights:', error);
        return false;
      }
    }
  }

  // Export for different module systems
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = TextHighlighter;
  } else if (typeof define === 'function' && define.amd) {
    define([], function() { return TextHighlighter; });
  } else {
    window.TextHighlighter = TextHighlighter;
  }