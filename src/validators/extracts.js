// src/validators/extracts.js
// Zod schemas for Extracts - install `zod` to use these validators
import { z } from 'zod'

export const extractLineSchema = z.object({
  itemId: z.number().int().positive(),
  // price and total are now optional: backend will fallback to item.defaultExtractPrice
  price: z.number().nonnegative().optional(),
  quantity: z.number().int().nonnegative(),
  total: z.number().nonnegative().optional()
}).refine(l => {
  // If both price and total are provided, validate price * quantity ~= total
  if (typeof l.price !== 'number' || typeof l.total !== 'number') return true
  return Math.abs(l.price * l.quantity - l.total) < 0.01
}, {
  message: 'Line total must equal price * quantity'
})

export const createExtractSchema = z.object({
  date: z.string().min(1),
  contractorId: z.number().int().positive(),
  locationId: z.number().int().positive(),
  areaId: z.number().int().positive().optional(),
  notes: z.string().optional(),
  total: z.number().nonnegative().optional(),
  lines: z.array(extractLineSchema).min(1),
  idempotencyKey: z.string().optional()
})

export function parseCreateExtract(payload) {
  return createExtractSchema.parse(payload)
}

export default {
  extractLineSchema,
  createExtractSchema,
  parseCreateExtract
}
