import { test, expect } from '@playwright/test'

// NOTE: This spec requires the full e2e stack (the `../accounting` backend on
// port 3001 and the frontend on port 8081) started by playwright.config.ts
// (webServer). It cannot run in environments where that backend is absent.

const SUPPLIES_API = '**/api/supplies'

const mockSupplies = {
  data: {
    total: 2,
    items: [
      {
        id: 1,
        date: '2026-01-10',
        item: { id: 11, name: 'Crushed Aggregate' },
        contractor: { id: 101, name: 'Contractor A' },
        hasPendingApproval: false,
        crusher: { id: 201, name: 'Crusher North' },
        location: { id: 301, name: 'Cairo' },
        area: { id: 401, name: 'Heliopolis' },
        vehicle: { id: 501, name: 'Plate 1234' },
        crusherTicket: 'CT-100',
        companyTicket: 'CO-100',
        companyCapacity: 20,
        crusherCapacity: 20,
        unitPrice: 175,
        discount: 0,
        total: 3500,
        notes: null,
      },
      {
        id: 2,
        date: '2026-01-11',
        item: { id: 12, name: 'Crushed Aggregate' },
        contractor: { id: 102, name: 'Contractor B' },
        hasPendingApproval: false,
        crusher: { id: 202, name: 'Crusher South' },
        location: { id: 302, name: 'Giza' },
        area: { id: 402, name: 'Dokki' },
        vehicle: { id: 502, name: 'Plate 5678' },
        crusherTicket: 'CT-101',
        companyTicket: 'CO-101',
        companyCapacity: 20,
        crusherCapacity: 20,
        unitPrice: 265,
        discount: 0,
        total: 5300,
        notes: 'ملاحظة',
      },
    ],
  },
}

test.describe('Supplies list table column parity', () => {
  test.beforeEach(async ({ page }) => {
    // Hide webpack dev server overlay that might block clicks
    await page.addInitScript(() => {
      const style = document.createElement('style')
      style.textContent = `
        #webpack-dev-server-client-overlay,
        iframe[src="about:blank"] {
          display: none !important;
          pointer-events: none !important;
          width: 0 !important;
          height: 0 !important;
          opacity: 0 !important;
        }
      `
      document.documentElement.appendChild(style)
    })

    // Mock the supplies list endpoint with fixture rows (real shape).
    await page.route(SUPPLIES_API, async (route) => {
      await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify(mockSupplies) })
    })

    await page.goto('/login')
    await page.fill('input[type="email"]', 'admin@example.com')
    await page.fill('input[type="password"]', 'ChangeMe123!')
    await page.click('button[type="submit"]')
    await page.waitForURL('**/dashboard/**')

    // The supplies list route requires the 'supplies.list' permission; the
    // seeded admin user has it. Navigate directly.
    await page.goto('/supplies/list')
    await page.waitForURL('**/supplies/list')
  })

  test('renders the same number of header cells and body cells', async ({ page }) => {
    // The table whose header contains the unit price column (سعر الوحدة / Unit Price).
    const table = page.locator('table:has(th:has-text("سعر الوحدة"), th:has-text("Unit Price"))')
    // Fall back to the first table if the localized locator doesn't match.
    const target = (await table.count() > 0) ? table : page.locator('table').first()

    const headerCells = target.locator('thead tr th')
    const headerCount = await headerCells.count()
    expect(headerCount).toBeGreaterThan(0)

    const rows = target.locator('tbody tr:has(td)')
    const rowCount = await rows.count()
    expect(rowCount).toBe(mockSupplies.data.items.length)

    for (let i = 0; i < rowCount; i++) {
      const bodyCells = rows.nth(i).locator('td')
      const bodyCount = await bodyCells.count()
      expect(bodyCount).toBe(headerCount)
    }
  })

  test('maps money columns to the correct fields', async ({ page }) => {
    const target = page.locator('table').first()
    const firstRow = target.locator('tbody tr:has(td)').first()
    const cells = firstRow.locator('td')

    // Column order: #, date, item, contractor, status, crusher, location, area,
    // vehicle, crusherTicket, companyTicket, companyCapacity, crusherCapacity,
    // unitPrice(14th), discount(15th), total(16th), notes(17th), actions(18th)
    await expect(cells.nth(13)).toContainText('EGP 175.00') // unitPrice
    await expect(cells.nth(14)).toContainText('EGP 0.00') // discount
    await expect(cells.nth(15)).toContainText('EGP 3,500.00') // total
    await expect(cells.nth(16)).toContainText('-') // notes (empty -> '-')

    const secondRow = target.locator('tbody tr:has(td)').nth(1)
    const secondCells = secondRow.locator('td')
    await expect(secondCells.nth(13)).toContainText('EGP 265.00') // unitPrice
    await expect(secondCells.nth(15)).toContainText('EGP 5,300.00') // total
    await expect(secondCells.nth(16)).toContainText('ملاحظة') // notes
  })
})
