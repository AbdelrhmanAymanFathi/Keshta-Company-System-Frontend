/**
 * Unit tests for settlementDate payload logic in Expenses module
 */

describe('Expenses settlementDate Payload Tests', () => {
  // Test helper: builds expense payload like the component does
  function buildExpensePayload(formData) {
    const expenseData = {
      date: formData.date,
      category: formData.category,
      description: formData.description,
      amount: parseFloat(formData.amount),
      flow: formData.flow || 'OUT',
      branchId: formData.branchId || null,
      locationId: formData.locationId || null,
      notes: formData.notes || ''
    }

    // Include settlementDate only for IN flow and when provided
    if (formData.flow === 'IN' && formData.settlementDate) {
      expenseData.settlementDate = formData.settlementDate
    }

    return expenseData
  }

  describe('Settlement Date Inclusion Logic', () => {
    it('should include settlementDate when flow=IN and settlementDate is provided', () => {
      const form = {
        date: '2025-11-12',
        category: 'Travel',
        description: 'Business trip',
        amount: 100,
        flow: 'IN',
        settlementDate: '2025-12-01',
        branchId: 1,
        locationId: null,
        notes: 'Conference trip'
      }

      const payload = buildExpensePayload(form)

      expect(payload).toHaveProperty('settlementDate')
      expect(payload.settlementDate).toBe('2025-12-01')
    })

    it('should NOT include settlementDate when flow=OUT regardless of date value', () => {
      const form = {
        date: '2025-11-12',
        category: 'Fuel',
        description: 'Gas',
        amount: 50,
        flow: 'OUT',
        settlementDate: '2025-12-01',
        branchId: 1,
        locationId: null,
        notes: ''
      }

      const payload = buildExpensePayload(form)

      expect(payload).not.toHaveProperty('settlementDate')
    })

    it('should NOT include settlementDate when flow=IN but settlementDate is empty/null', () => {
      const form = {
        date: '2025-11-12',
        category: 'Travel',
        description: 'Business trip',
        amount: 100,
        flow: 'IN',
        settlementDate: null,
        branchId: 1,
        locationId: null,
        notes: ''
      }

      const payload = buildExpensePayload(form)

      expect(payload).not.toHaveProperty('settlementDate')
    })

    it('should NOT include settlementDate when flow=IN but settlementDate is empty string', () => {
      const form = {
        date: '2025-11-12',
        category: 'Travel',
        description: 'Business trip',
        amount: 100,
        flow: 'IN',
        settlementDate: '',
        branchId: 1,
        locationId: null,
        notes: ''
      }

      const payload = buildExpensePayload(form)

      expect(payload).not.toHaveProperty('settlementDate')
    })

    it('should include all base fields regardless of flow type', () => {
      const form = {
        date: '2025-11-12',
        category: 'Office',
        description: 'Supplies',
        amount: 250.75,
        flow: 'OUT',
        settlementDate: null,
        branchId: 2,
        locationId: 5,
        notes: 'Monthly supplies'
      }

      const payload = buildExpensePayload(form)

      expect(payload.date).toBe('2025-11-12')
      expect(payload.category).toBe('Office')
      expect(payload.description).toBe('Supplies')
      expect(payload.amount).toBe(250.75)
      expect(payload.flow).toBe('OUT')
      expect(payload.branchId).toBe(2)
      expect(payload.locationId).toBe(5)
      expect(payload.notes).toBe('Monthly supplies')
    })

    it('should default flow to OUT if not provided', () => {
      const form = {
        date: '2025-11-12',
        category: 'Travel',
        description: 'Business trip',
        amount: 100,
        // flow not provided
        settlementDate: null,
        branchId: 1,
        locationId: null,
        notes: ''
      }

      const payload = buildExpensePayload(form)

      expect(payload.flow).toBe('OUT')
    })
  })

  describe('Edge Cases and Type Coercion', () => {
    it('should handle numeric amounts correctly', () => {
      const form = {
        date: '2025-11-12',
        category: 'Equipment',
        description: 'Software license',
        amount: '999.99',
        flow: 'OUT',
        settlementDate: null,
        branchId: 1,
        locationId: null,
        notes: ''
      }

      const payload = buildExpensePayload(form)

      expect(payload.amount).toBe(999.99)
      expect(typeof payload.amount).toBe('number')
    })

    it('should handle null branchId and locationId', () => {
      const form = {
        date: '2025-11-12',
        category: 'Other',
        description: 'Misc',
        amount: 100,
        flow: 'OUT',
        settlementDate: null,
        branchId: null,
        locationId: null,
        notes: ''
      }

      const payload = buildExpensePayload(form)

      expect(payload.branchId).toBeNull()
      expect(payload.locationId).toBeNull()
    })

    it('should not include empty notes as undefined', () => {
      const form = {
        date: '2025-11-12',
        category: 'Travel',
        description: 'Flight',
        amount: 500,
        flow: 'IN',
        settlementDate: '2025-12-15',
        branchId: 1,
        locationId: null,
        notes: '' // empty
      }

      const payload = buildExpensePayload(form)

      expect(payload.notes).toBe('')
      expect(payload).toHaveProperty('notes')
    })
  })
})
