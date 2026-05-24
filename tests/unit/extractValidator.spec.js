/* global test, expect */
import { extractLineSchema, createExtractSchema } from '../../src/validators/extracts'

test('extractLineSchema allows missing price when total provided', () => {
  const line = { itemId: '1', quantity: 2, total: 200 }
  const parsed = extractLineSchema.parse(line)
  expect(parsed.total).toBe(200)
})

test('createExtractSchema allows missing document total', () => {
  const payload = {
    contractorId: '1',
    locationId: '1',
    lines: [{ itemId: '1', price: 100, quantity: 2 }]
  }
  const parsed = createExtractSchema.parse(payload)
  expect(parsed.lines.length).toBe(1)
})
