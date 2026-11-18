import { describe, expect, test } from 'vitest'
import { normalizeAboutOrder, normalizeSectionOrder } from '@/lib/flagship/sections'

describe('normalizeSectionOrder', () => {
  test('falls back to the default order when none is saved', () => {
    expect(normalizeSectionOrder(undefined)).toEqual(['about', 'speakers', 'programme', 'venue', 'faqs'])
  })

  test('keeps a saved order', () => {
    const order = ['venue', 'faqs', 'about', 'programme', 'speakers']
    expect(normalizeSectionOrder(order)).toEqual(order)
  })

  test('drops unknown and repeated ids and appends missing sections', () => {
    expect(normalizeSectionOrder(['faqs', 'hero', 'faqs', 'venue'])).toEqual([
      'faqs',
      'venue',
      'about',
      'speakers',
      'programme',
    ])
  })
})

describe('normalizeAboutOrder', () => {
  test('puts the description first by default', () => {
    expect(normalizeAboutOrder(undefined)).toEqual(['description', 'highlights'])
  })

  test('keeps highlights first when saved that way', () => {
    expect(normalizeAboutOrder(['highlights', 'description'])).toEqual(['highlights', 'description'])
  })
})
