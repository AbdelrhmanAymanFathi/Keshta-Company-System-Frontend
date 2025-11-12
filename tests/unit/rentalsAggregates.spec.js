/**
 * Unit tests for Rentals totals calculation and filtering logic
 */

describe('Rentals Aggregates and Filtering Tests', () => {
  // Test helper: builds filtered items like the component does
  function filterItemsByOwnership(items, ownershipFilter) {
    if (ownershipFilter === null || ownershipFilter === undefined) return items
    return items.filter(item => {
      const val = item.isCompanyOwned
      if (typeof val === 'boolean') return val === ownershipFilter
      if (typeof val === 'string') {
        const s = val.toLowerCase()
        if (s === 'true' || s === '1') return ownershipFilter === true
        if (s === 'false' || s === '0') return ownershipFilter === false
      }
      if (typeof val === 'number') return (val === 1) === ownershipFilter
      return Boolean(val) === Boolean(ownershipFilter)
    })
  }

  // Test helper: calculates total sum like the component does
  function calculateTotalSum(items) {
    return items.reduce((sum, item) => {
      const itemTotal = parseFloat(String(item.total || 0).replace(/,/g, '')) || 0
      return sum + itemTotal
    }, 0)
  }

  const mockRentals = [
    { id: 1, name: 'Excavator', total: '1000.00', isCompanyOwned: true },
    { id: 2, name: 'Roller', total: '750.50', isCompanyOwned: true },
    { id: 3, name: 'Crane', total: '2500.00', isCompanyOwned: false },
    { id: 4, name: 'Bulldozer', total: '1,200.00', isCompanyOwned: true },
    { id: 5, name: 'Loader', total: 800, isCompanyOwned: false }
  ]

  describe('Ownership Filtering', () => {
    it('should return all items when filter is null', () => {
      const filtered = filterItemsByOwnership(mockRentals, null)
      expect(filtered).toHaveLength(5)
    })

    it('should return only company-owned items when filter is true', () => {
      const filtered = filterItemsByOwnership(mockRentals, true)
      expect(filtered).toHaveLength(3)
      expect(filtered.every(item => item.isCompanyOwned === true)).toBe(true)
    })

    it('should return only external items when filter is false', () => {
      const filtered = filterItemsByOwnership(mockRentals, false)
      expect(filtered).toHaveLength(2)
      expect(filtered.every(item => item.isCompanyOwned === false)).toBe(true)
    })

    it('should handle string boolean values (true string)', () => {
      const itemsWithStringBool = [
        { id: 1, name: 'Item A', total: '100', isCompanyOwned: 'true' },
        { id: 2, name: 'Item B', total: '200', isCompanyOwned: false }
      ]
      const filtered = filterItemsByOwnership(itemsWithStringBool, true)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe(1)
    })

    it('should handle string boolean values (false string)', () => {
      const itemsWithStringBool = [
        { id: 1, name: 'Item A', total: '100', isCompanyOwned: 'true' },
        { id: 2, name: 'Item B', total: '200', isCompanyOwned: 'false' }
      ]
      const filtered = filterItemsByOwnership(itemsWithStringBool, false)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe(2)
    })

    it('should handle numeric boolean values (1 for true)', () => {
      const itemsWithNumericBool = [
        { id: 1, name: 'Item A', total: '100', isCompanyOwned: 1 },
        { id: 2, name: 'Item B', total: '200', isCompanyOwned: 0 }
      ]
      const filtered = filterItemsByOwnership(itemsWithNumericBool, true)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe(1)
    })

    it('should handle numeric boolean values (0 for false)', () => {
      const itemsWithNumericBool = [
        { id: 1, name: 'Item A', total: '100', isCompanyOwned: 1 },
        { id: 2, name: 'Item B', total: '200', isCompanyOwned: 0 }
      ]
      const filtered = filterItemsByOwnership(itemsWithNumericBool, false)
      expect(filtered).toHaveLength(1)
      expect(filtered[0].id).toBe(2)
    })
  })

  describe('Total Sum Calculation', () => {
    it('should calculate correct sum for all items', () => {
      const sum = calculateTotalSum(mockRentals)
      // 1000 + 750.50 + 2500 + 1200 + 800 = 6250.50
      expect(sum).toBeCloseTo(6250.5, 2)
    })

    it('should calculate sum for filtered company-owned items', () => {
      const filtered = filterItemsByOwnership(mockRentals, true)
      const sum = calculateTotalSum(filtered)
      // 1000 + 750.50 + 1200 = 2950.50
      expect(sum).toBeCloseTo(2950.5, 2)
    })

    it('should calculate sum for filtered external items', () => {
      const filtered = filterItemsByOwnership(mockRentals, false)
      const sum = calculateTotalSum(filtered)
      // 2500 + 800 = 3300
      expect(sum).toBeCloseTo(3300, 2)
    })

    it('should handle comma-separated numbers in totals', () => {
      const itemsWithCommas = [
        { id: 1, name: 'A', total: '1,000.00', isCompanyOwned: true },
        { id: 2, name: 'B', total: '2,500.50', isCompanyOwned: true }
      ]
      const sum = calculateTotalSum(itemsWithCommas)
      expect(sum).toBeCloseTo(3500.5, 2)
    })

    it('should handle numeric totals (not strings)', () => {
      const itemsWithNumericTotals = [
        { id: 1, name: 'A', total: 100, isCompanyOwned: true },
        { id: 2, name: 'B', total: 200.75, isCompanyOwned: true }
      ]
      const sum = calculateTotalSum(itemsWithNumericTotals)
      expect(sum).toBeCloseTo(300.75, 2)
    })

    it('should handle null/undefined totals as 0', () => {
      const itemsWithNulls = [
        { id: 1, name: 'A', total: '100', isCompanyOwned: true },
        { id: 2, name: 'B', total: null, isCompanyOwned: true },
        { id: 3, name: 'C', total: undefined, isCompanyOwned: true },
        { id: 4, name: 'D', total: '200', isCompanyOwned: true }
      ]
      const sum = calculateTotalSum(itemsWithNulls)
      expect(sum).toBeCloseTo(300, 2)
    })

    it('should handle empty string totals as 0', () => {
      const itemsWithEmpty = [
        { id: 1, name: 'A', total: '100', isCompanyOwned: true },
        { id: 2, name: 'B', total: '', isCompanyOwned: true },
        { id: 3, name: 'C', total: '200', isCompanyOwned: true }
      ]
      const sum = calculateTotalSum(itemsWithEmpty)
      expect(sum).toBeCloseTo(300, 2)
    })

    it('should return 0 for empty items array', () => {
      const sum = calculateTotalSum([])
      expect(sum).toBe(0)
    })
  })

  describe('Count Calculation', () => {
    it('should count all items when filter is null', () => {
      const filtered = filterItemsByOwnership(mockRentals, null)
      expect(filtered.length).toBe(5)
    })

    it('should count only company-owned items', () => {
      const filtered = filterItemsByOwnership(mockRentals, true)
      expect(filtered.length).toBe(3)
    })

    it('should count only external items', () => {
      const filtered = filterItemsByOwnership(mockRentals, false)
      expect(filtered.length).toBe(2)
    })

    it('should return 0 for items matching empty filter', () => {
      const itemsAllCompany = mockRentals.filter(i => i.isCompanyOwned === true)
      const filtered = filterItemsByOwnership(itemsAllCompany, false)
      expect(filtered.length).toBe(0)
    })
  })

  describe('Integration: Filter + Aggregate', () => {
    it('should calculate count and sum together for same filtered set', () => {
      const filter = true
      const filtered = filterItemsByOwnership(mockRentals, filter)
      const count = filtered.length
      const sum = calculateTotalSum(filtered)

      expect(count).toBe(3)
      expect(sum).toBeCloseTo(2950.5, 2)
    })

    it('should handle chain: filter all → count 5 → sum 6250.50', () => {
      const filtered = filterItemsByOwnership(mockRentals, null)
      const count = filtered.length
      const sum = calculateTotalSum(filtered)

      expect(count).toBe(5)
      expect(sum).toBeCloseTo(6250.5, 2)
    })

    it('should handle chain: filter false → count 2 → sum 3300', () => {
      const filtered = filterItemsByOwnership(mockRentals, false)
      const count = filtered.length
      const sum = calculateTotalSum(filtered)

      expect(count).toBe(2)
      expect(sum).toBeCloseTo(3300, 2)
    })
  })
})
