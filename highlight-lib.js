// highlight-lib.js

(function() {
    const LIBRARY_NAME = 'HighlighterLib';

    let db;
    const DB_NAME = 'HighlightDB';
    const DB_VERSION = 1;
    const OBJECT_STORE_NAME = 'highlights';

    const quickbarId = 'highlightQuickbar';
    const highlightClass = 'highlighted-text';

    function initDB() {
        return new Promise((resolve, reject) => {
            const request = indexedDB.open(DB_NAME, DB_VERSION);

            request.onerror = (event) => {
                console.error("IndexedDB error:", event);
                reject(event);
            };

            request.onsuccess = (event) => {
                db = event.target.result;
                resolve(db);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                db.createObjectStore(OBJECT_STORE_NAME, { keyPath: 'url' });
            };
        });
    }

    function getSurroundingText(range, wordsBefore = 10, wordsAfter = 10) {
        const startNode = range.startContainer;
        const endNode = range.endContainer;

        let fullText = startNode.textContent || '';
        let startIndex = range.startOffset;
        let endIndex = range.endOffset;

        if (startNode !== endNode) {
            console.warn("Selection spans multiple nodes. Surrounding text might be incomplete.");
            fullText = range.commonAncestorContainer.textContent || '';
            startIndex = fullText.indexOf(range.toString());
            endIndex = startIndex + range.toString().length;

            if (startIndex === -1) {
                return { before: '', after: '' };
            }
        }

        const textBefore = fullText.substring(0, startIndex).split(/\s+/).slice(-wordsBefore).join(' ');
        const textAfter = fullText.substring(endIndex).split(/\s+/).slice(0, wordsAfter).join(' ');

        return { before: textBefore, after: textAfter };
    }

    function getContainerIdentifier(node) {
        while (node && node !== document.body) {
            if (node.id) {
                return { type: 'id', value: node.id };
            }
            node = node.parentNode;
        }
        // Fallback to XPath
        return { type: 'xpath', value: getXPath(node) };
    }

    function getXPath(element) {
        if (element && element.id)
            return '//*[@id="' + element.id + '"]';
        if (element && element === document.body)
            return '/html/body';
        if (!element || !element.parentNode)
            return '';
        let ix = 0;
        let siblings = element.parentNode.childNodes;
        for (let i = 0; i < siblings.length; i++) {
            let sibling = siblings[i];
            if (sibling === element)
                return getXPath(element.parentNode) + '/' + element.tagName + '[' + (ix + 1) + ']';
            if (sibling.nodeType === 1 && sibling.tagName === element.tagName)
                ix++;
        }
    }

    function getNodeByContainerIdentifier(identifier) {
        if (!identifier) return null;

        if (identifier.type === 'id') {
            return document.getElementById(identifier.value);
        } else if (identifier.type === 'xpath') {
            return document.evaluate(identifier.value, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE, null).singleNodeValue;
        }
        return null;
    }

    function saveHighlight(url, selectionText, color, range, surroundingText) {
        const highlightData = {
            url: url,
            text: selectionText,
            color: color,
            containerIdentifier: getContainerIdentifier(range.startContainer.parentElement),
            startOffset: range.startOffset,
            endOffset: range.endOffset,
            before: surroundingText.before,
            after: surroundingText.after
        };

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([OBJECT_STORE_NAME], 'readwrite');
            const objectStore = transaction.objectStore(OBJECT_STORE_NAME);
            const request = objectStore.put(highlightData);

            request.onsuccess = () => {
                console.log('Highlight saved:', highlightData);
                resolve();
            };

            request.onerror = (event) => {
                console.error('Error saving highlight:', event);
                reject(event);
            };
        });
    }

    function removeHighlightFromDB(url, text, containerIdentifier, startOffset, endOffset) {
        return new Promise((resolve, reject) => {
            const transaction = db.transaction([OBJECT_STORE_NAME], 'readwrite');
            const objectStore = transaction.objectStore(OBJECT_STORE_NAME);
            const request = objectStore.get(url);

            request.onsuccess = (event) => {
                const highlightData = event.target.result;
                if (highlightData) {
                    if (highlightData.text === text &&
                        JSON.stringify(highlightData.containerIdentifier) === JSON.stringify(containerIdentifier) &&
                        highlightData.startOffset === startOffset &&
                        highlightData.endOffset === endOffset) {

                        const deleteRequest = objectStore.delete(url);

                        deleteRequest.onsuccess = () => {
                            console.log('Highlight removed from DB:', highlightData);
                            resolve();
                        };

                        deleteRequest.onerror = (event) => {
                            console.error('Error removing highlight from DB:', event);
                            reject(event);
                        };
                    } else {
                        resolve(); // Highlight data doesn't match
                    }
                } else {
                    resolve(); // No highlight data found for this URL
                }
            };

            request.onerror = (event) => {
                console.error('Error getting highlight:', event);
                reject(event);
            };
        });
    }


    function applyHighlight(element, color) {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const selectedText = range.toString();

        if (selectedText.trim() === '') return;

        const surroundingText = getSurroundingText(range);

        if (isHighlightOverlapping(range)) {
            console.warn("Highlight overlaps with existing highlight. Skipping.");
            selection.removeAllRanges();
            hideQuickbar();
            return;
        }

        saveHighlight(window.location.href, selectedText, color, range, surroundingText)
            .then(() => {
                const span = document.createElement('span');
                span.style.backgroundColor = color;
                span.className = highlightClass;
                range.surroundContents(span);
                selection.removeAllRanges();
            })
            .catch(error => {
                console.error("Error applying highlight:", error);
            });
    }

    function removeHighlight() {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) return;

        const range = selection.getRangeAt(0);
        const selectedText = range.toString();

        if (selectedText.trim() === '') return;

        const containerIdentifier = getContainerIdentifier(range.startContainer.parentElement);
        const startOffset = range.startOffset;
        const endOffset = range.endOffset;

        removeHighlightFromDB(window.location.href, selectedText, containerIdentifier, startOffset, endOffset)
            .then(() => {
                //Unwrap the highlight element.
                const highlightElement = range.startContainer.parentElement;

                if (highlightElement && highlightElement.classList.contains(highlightClass)) {
                    const text = document.createTextNode(highlightElement.textContent);
                    highlightElement.parentNode.replaceChild(text, highlightElement);

                }
                selection.removeAllRanges();
                hideQuickbar();
            })
            .catch(error => {
                console.error("Error removing highlight:", error);
            });
    }

    function isHighlightOverlapping(range) {
        const highlights = document.querySelectorAll('.' + highlightClass);
        for (let i = 0; i < highlights.length; i++) {
            const highlight = highlights[i];
            const highlightRange = document.createRange();
            highlightRange.selectNodeContents(highlight);

            if (range.compareBoundaryPoints(Range.START_TO_END, highlightRange) < 0 &&
                range.compareBoundaryPoints(Range.END_TO_START, highlightRange) > 0) {
                return true;
            }
        }
        return false;
    }

    function createQuickbar() {
        const quickbar = document.createElement('div');
        quickbar.id = quickbarId;
        quickbar.style.position = 'absolute';
        quickbar.style.display = 'none';
        quickbar.style.zIndex = 1000;
        quickbar.style.backgroundColor = 'white';
        quickbar.style.border = '1px solid #ccc';
        quickbar.style.padding = '5px';
        quickbar.style.borderRadius = '5px';

        const colors = ['yellow', 'lightgreen', 'lightblue', 'pink'];
        colors.forEach(color => {
            const colorButton = document.createElement('button');
            colorButton.style.backgroundColor = color;
            colorButton.style.width = '20px';
            colorButton.style.height = '20px';
            colorButton.style.border = 'none';
            colorButton.style.marginRight = '5px';
            colorButton.addEventListener('click', () => {
                applyHighlight(document.body, color);
                hideQuickbar();
            });
            quickbar.appendChild(colorButton);
        });

        // Add remove highlight button
        const removeButton = document.createElement('button');
        removeButton.textContent = 'Remove';
        removeButton.addEventListener('click', () => {
            removeHighlight();
            hideQuickbar();
        });
        quickbar.appendChild(removeButton);

        document.body.appendChild(quickbar);
        return quickbar;
    }

    function showQuickbar(x, y) {
        const quickbar = document.getElementById(quickbarId);
        quickbar.style.left = x + 'px';
        quickbar.style.top = y + 'px';
        quickbar.style.display = 'block';
    }

    function hideQuickbar() {
        const quickbar = document.getElementById(quickbarId);
        quickbar.style.display = 'none';
    }

    function handleSelection(event) {
        const selection = window.getSelection();
        if (selection.rangeCount === 0) {
            hideQuickbar();
            return;
        }

        const selectedText = selection.toString();
        if (selectedText.trim() === '') {
            hideQuickbar();
            return;
        }

        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        showQuickbar(rect.left + window.scrollX, rect.top + window.scrollY - 30);
    }

    function restoreHighlights() {
        const url = window.location.href;

        return new Promise((resolve, reject) => {
            const transaction = db.transaction([OBJECT_STORE_NAME], 'readonly');
            const objectStore = transaction.objectStore(OBJECT_STORE_NAME);
            const request = objectStore.get(url);

            request.onsuccess = (event) => {
                const highlightData = event.target.result;
                if (highlightData) {
                    console.log('Restoring highlight:', highlightData);
                    try {
                        restoreHighlightFromData(highlightData);
                    } catch (error) {
                        console.error("Error restoring highlight:", error);
                    }
                }
                resolve();
            };

            request.onerror = (event) => {
                console.error('Error getting highlight:', event);
                reject(event);
            };
        });
    }

    function restoreHighlightFromData(highlightData) {
        const container = getNodeByContainerIdentifier(highlightData.containerIdentifier);

        if (!container) {
            console.warn("Container element not found. Cannot restore highlight.");
            restoreHighlightApproximate(highlightData);
            return;
        }

        const regex = new RegExp(escapeRegExp(highlightData.text), 'g');
        let match;

        let textNodes = [];
        function getTextNodes(node) {
            if (node.nodeType === Node.TEXT_NODE) {
                textNodes.push(node);
            } else {
                for (let i = 0; i < node.childNodes.length; i++) {
                    getTextNodes(node.childNodes[i]);
                }
            }
        }

        getTextNodes(container);

        for (const textNode of textNodes) {
            while ((match = regex.exec(textNode.textContent)) !== null) {
                try {
                    const range = document.createRange();
                    range.setStart(textNode, match.index);
                    range.setEnd(textNode, match.index + highlightData.text.length);
                    const span = document.createElement('span');
                    span.style.backgroundColor = highlightData.color;
                    span.className = highlightClass;

                    if (!isHighlightOverlapping(range)) {
                        range.surroundContents(span);
                        return;
                    }

                } catch (error) {
                    console.error("Error restoring highlight:", error);
                }
            }
        }

        console.warn("Approximate restore needed");
        restoreHighlightApproximate(highlightData);
    }

    function restoreHighlightApproximate(highlightData) {
        const context = highlightData.before + ' ' + highlightData.text + ' ' + highlightData.after;

        const regex = new RegExp(escapeRegExp(highlightData.text), 'g');
        const elements = document.querySelectorAll('body *');

        for (let i = 0; i < elements.length; i++) {
            const element = elements[i];
            if (element.nodeType === Node.TEXT_NODE) {
                let match;
                while ((match = regex.exec(element.textContent)) !== null) {
                    const range = document.createRange();
                    range.setStart(element, match.index);
                    range.setEnd(element, match.index + highlightData.text.length);

                    const span = document.createElement('span');
                    span.style.backgroundColor = highlightData.color;
                    span.className = highlightClass;
                    try {
                        range.surroundContents(span);
                    } catch (e) {
                        console.error("Error applying highlight, likely overlapping elements. Skipping.", e);
                    }
                }
            }
        }
    }

    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    // Public API
    window[LIBRARY_NAME] = {
        initialize: function () {
            initDB()
                .then(() => {
                    console.log('IndexedDB initialized.');
                    createQuickbar();
                    document.addEventListener('mouseup', handleSelection);
                    restoreHighlights();
                })
                .catch(error => {
                    console.error("Failed to initialize:", error);
                });
        },
        destroy: function () {
            document.removeEventListener('mouseup', handleSelection);
            const quickbar = document.getElementById(quickbarId);
            if (quickbar) {
                quickbar.remove();
            }
        }
    };

})();