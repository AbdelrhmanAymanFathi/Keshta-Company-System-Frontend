// src/validators/extracts.js
// Zod schemas for Extracts - install `zod` to use these validators
import { z } from 'zod'

export const extractLineSchema = z.object({
  itemId: z.coerce.number().int().positive(),
  // price and total are now optional: backend will fallback to item.defaultExtractPrice
  price: z.coerce.number().nonnegative().optional(),
  quantity: z.coerce.number().nonnegative(),
  discount: z.coerce.number().nonnegative().optional(),
  total: z.coerce.number().nonnegative().optional()
}).refine(l => {
  // If both price and total are provided, accept either gross or discount-adjusted totals.
  if (typeof l.price !== 'number' || typeof l.total !== 'number') return true
  const gross = l.price * l.quantity
  const discount = typeof l.discount === 'number' ? l.discount : 0
  const net = Math.max(0, gross - discount)
  return Math.abs(gross - l.total) < 0.01 || Math.abs(net - l.total) < 0.01
}, {
  message: 'Line total must equal price * quantity'
})

export const createExtractSchema = z.object({
  dateFrom: z.string().min(1),
  dateTo: z.string().min(1),
  contractorId: z.number().int().positive(),
  locationId: z.number().int().positive(),
  areaId: z.number().int().positive().optional(),
  notes: z.string().optional(),
  total: z.number().nonnegative().optional(),
  lines: z.array(extractLineSchema).min(1),
  idempotencyKey: z.string().optional()
}).refine(payload => payload.dateTo >= payload.dateFrom, {
  message: 'Date To must be greater than or equal to Date From',
  path: ['dateTo']
})

export function parseCreateExtract(payload) {
  return createExtractSchema.parse(payload)
}

export default {
  extractLineSchema,
  createExtractSchema,
  parseCreateExtract
}
