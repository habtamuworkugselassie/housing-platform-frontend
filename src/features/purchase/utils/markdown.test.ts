import { describe, expect, it } from 'vitest'
import { renderMarkdown } from './markdown'

describe('renderMarkdown', () => {
  it('renders the subset the agreement templates use', () => {
    const html = renderMarkdown('# Title\n\nHello **bold** and *it*.\n\n- a\n- b\n\n1. one\n2. two\n\n---\n\nEnd')
    expect(html).toContain('<h1>Title</h1>')
    expect(html).toContain('<strong>bold</strong>')
    expect(html).toContain('<em>it</em>')
    expect(html).toContain('<ul>\n<li>a</li>\n<li>b</li>\n</ul>')
    expect(html).toContain('<ol>\n<li>one</li>\n<li>two</li>\n</ol>')
    expect(html).toContain('<hr>')
    expect(html).toContain('<p>End</p>')
  })

  it('escapes HTML so server text can never inject markup', () => {
    const html = renderMarkdown('<script>alert(1)</script> & <img src=x onerror=y>')
    expect(html).not.toContain('<script>')
    expect(html).not.toContain('<img')
    expect(html).toContain('&lt;script&gt;')
    expect(html).toContain('&amp;')
  })

  it('keeps line breaks inside a paragraph and handles empty input', () => {
    expect(renderMarkdown('a\nb')).toBe('<p>a<br>b</p>')
    expect(renderMarkdown('')).toBe('')
    expect(renderMarkdown(null)).toBe('')
  })
})
