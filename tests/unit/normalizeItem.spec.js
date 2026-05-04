import normalizeItem from '../../src/utils/normalizeItem'

test('normalizeItem preserves defaultExtractPrice and converts to number', () => {
  const raw = { id: 1, name: 'Stone', default_extract_price: '123.45' }
  const n = normalizeItem(raw)
  expect(n.defaultExtractPrice).toBe(123.45)
})
