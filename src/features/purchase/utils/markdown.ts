/**
 * Tiny Markdown → HTML renderer for agreement texts. Escapes everything first, then supports the
 * subset the agreement templates use: headings, paragraphs, bold, italics, bullet lists,
 * numbered lists and horizontal rules. No raw HTML, links or images pass through, so the output
 * is safe to bind with v-html even though the text comes from the server.
 */
function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}

function inline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/(^|[^*])\*([^*\n]+?)\*(?!\*)/g, '$1<em>$2</em>')
}

export function renderMarkdown(markdown: string | null | undefined): string {
  if (!markdown) return ''
  const lines = markdown.replace(/\r\n/g, '\n').split('\n')
  const out: string[] = []
  let list: 'ul' | 'ol' | null = null
  let paragraph: string[] = []

  const flushParagraph = () => {
    if (paragraph.length) {
      out.push(`<p>${paragraph.map(inline).join('<br>')}</p>`)
      paragraph = []
    }
  }
  const closeList = () => {
    if (list) {
      out.push(`</${list}>`)
      list = null
    }
  }

  for (const rawLine of lines) {
    const line = rawLine.trimEnd()
    if (!line.trim()) {
      flushParagraph()
      closeList()
      continue
    }
    const heading = /^(#{1,6})\s+(.*)$/.exec(line)
    if (heading) {
      flushParagraph()
      closeList()
      const level = heading[1].length
      out.push(`<h${level}>${inline(heading[2])}</h${level}>`)
      continue
    }
    if (/^(-{3,}|\*{3,}|_{3,})$/.test(line.trim())) {
      flushParagraph()
      closeList()
      out.push('<hr>')
      continue
    }
    const bullet = /^\s*[-*]\s+(.*)$/.exec(line)
    if (bullet) {
      flushParagraph()
      if (list !== 'ul') {
        closeList()
        list = 'ul'
        out.push('<ul>')
      }
      out.push(`<li>${inline(bullet[1])}</li>`)
      continue
    }
    const numbered = /^\s*\d+[.)]\s+(.*)$/.exec(line)
    if (numbered) {
      flushParagraph()
      if (list !== 'ol') {
        closeList()
        list = 'ol'
        out.push('<ol>')
      }
      out.push(`<li>${inline(numbered[1])}</li>`)
      continue
    }
    closeList()
    paragraph.push(line.trim())
  }
  flushParagraph()
  closeList()
  return out.join('\n')
}
