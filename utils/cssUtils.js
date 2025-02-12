/**
 * Extracts all class names from the given HTML content.
 * 
 * @param {string} htmlContent - The HTML content to extract class names from.
 * @returns {string[]} An array of unique class names found in the HTML content.
 */
export function extractClassesFromHTML(htmlContent) {
    // Extract all class names from the HTML content
    const classPattern = /class=["']([^"']+)["']/g;
    const classes = new Set();
    let match;

    while ((match = classPattern.exec(htmlContent)) !== null) {
        match[1].split(/\s+/).forEach(cls => classes.add(cls));
    }

    return Array.from(classes);
}

/**
 * Filters the given CSS content to include only rules matching the specified classes.
 * 
 * @param {string} cssContent - The CSS content to filter.
 * @param {string[]} classes - An array of class names to filter the CSS by.
 * @returns {string[]} An array of filtered CSS rules.
 */
export function filterCSSByClasses(cssContent, classes) {
    // Filter CSS to include only rules matching the classes
    const filteredCSS = [];
    const classSelectorPattern = /([^{]+)\s*{/g;
    let match;

    while ((match = classSelectorPattern.exec(cssContent)) !== null) {
        const selector = match[1].trim();
        if (classes.some(cls => selector.split(/[\s,.>+~]+/).includes(cls))) {
            const startIndex = match.index;
            const endIndex = cssContent.indexOf('}', startIndex) + 1;
            filteredCSS.push(cssContent.slice(startIndex, endIndex));
        }
    }

    return filteredCSS.join("\n");
}

/**
 * Applies custom css content to an html string
 * 
 * @param {string} htmlContent - The HTML content to apply css.
 * @param {string} filteredCSS - The css content to apply to the HTML content.
 * @returns {string} An html with css
 */
export function injectCSSIntoHTML(htmlContent, filteredCSS) {
    // Check if <head> tag exists, if not add one
    if (!/<head>/i.test(htmlContent)) {
        const headTag = `<head>\n<style>\n${filteredCSS}\n</style>\n</head>`;
        return htmlContent.replace(/<html>/i, `<html>\n${headTag}`);
    }

    // If <head> exists, inject the CSS before </head>
    const styleTag = `<style>\n${filteredCSS}\n</style>`;
    return htmlContent.replace(/<\/head>/i, `${styleTag}\n</head>`);
}