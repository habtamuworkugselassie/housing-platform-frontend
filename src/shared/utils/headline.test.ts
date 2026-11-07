import { describe, expect, it } from 'vitest'
import { splitHeadline } from './headline'

describe('splitHeadline', () => {
  it('takes the last word as the accent', () => {
    expect(splitHeadline('Ethiopia Real Estate Expo and Construction Exhibition')).toEqual({
      lead: 'Ethiopia Real Estate Expo and Construction',
      accent: 'Exhibition',
    })
  })
  it('works for Amharic, which also separates words with spaces', () => {
    expect(splitHeadline('የኢትዮጵያ የሪል እስቴት ኤክስፖ እና የግንባታ ኤግዚቢሽን').accent).toBe('ኤግዚቢሽን')
  })
  it('puts a single word entirely in the accent', () => {
    expect(splitHeadline('Expo')).toEqual({ lead: '', accent: 'Expo' })
    expect(splitHeadline('')).toEqual({ lead: '', accent: '' })
  })
})
