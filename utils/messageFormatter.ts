// utils/messageFormatter.ts

import { marked } from 'marked'
import DOMPurify from 'dompurify'
import highlight from 'highlight.js'

/**
 * Configuration for message formatting
 */
interface FormatOptions {
  enableMarkdown?: boolean
  enableHighlight?: boolean
  allowedTags?: string[]
}

export class MessageFormatter {
  private static defaultOptions: FormatOptions = {
    enableMarkdown: true,
    enableHighlight: true,
    allowedTags: ['p', 'br', 'strong', 'em', 'code', 'pre', 'blockquote', 'a', 'ul', 'ol', 'li']
  }

  /**
   * Configures marked with syntax highlighting
   */
  private static configureMarked() {
    const renderer = new marked.Renderer()
    renderer.code = ({ text, lang }: { text: string, lang?: string }): string => {
      if (lang && highlight.getLanguage(lang)) {
        return `<pre><code class="hljs ${lang}">${highlight.highlight(text, { language: lang }).value}</code></pre>`
      }
      return `<pre><code class="hljs">${highlight.highlightAuto(text).value}</code></pre>`
    }

    marked.setOptions({
      renderer,
      breaks: true,
      gfm: true
    })
  }

  /**
   * Formats a message with markdown and code highlighting
   */
  static format(content: string, options: FormatOptions = {}): string {
    const opts = { ...this.defaultOptions, ...options }
    this.configureMarked()

    let formatted = content

    if (opts.enableMarkdown) {
      const markedResult = marked(formatted)
      if (markedResult instanceof Promise) {
        markedResult.then(result => {
          formatted = result
        })
      } else {
        formatted = markedResult
      }
    }

    // Sanitize HTML
    formatted = DOMPurify.sanitize(formatted, {
      ALLOWED_TAGS: opts.allowedTags,
      ALLOWED_ATTR: ['href', 'target', 'class', 'rel']
    })

    return formatted
  }

  /**
   * Detects code blocks in message and returns language info
   */
  static detectCodeBlocks(content: string): { language: string, count: number } {
    const codeBlockRegex = /```(\w+)?\n[\s\S]*?```/g
    const matches = content.match(codeBlockRegex) || []
    
    let primaryLanguage = 'plaintext'
    if (matches.length > 0) {
      const firstMatch = matches[0]
      if (firstMatch) {
        const languageMatch = firstMatch.match(/```(\w+)/)
        if (languageMatch && languageMatch[1]) {
          primaryLanguage = languageMatch[1]
        }
      }
    }

    return {
      language: primaryLanguage,
      count: matches.length
    }
  }
}