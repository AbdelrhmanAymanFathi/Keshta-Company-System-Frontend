// v-app-table — fills in what the phone layout of `.app-table` needs (see "App tables" in
// assets/main.css). Every body cell gets `data-label` copied from its column header, so the
// templates don't repeat the labels on each <td>.
//
// A header cell can set data-col to place its column in the phone layout:
//   title | subtitle | amount  → heading line of the row (like the expenses cards)
//   hide-mobile                → not shown on phones
//   actions                    → buttons row at the bottom (detected automatically too)
// A body cell may set data-col itself to override its column.

function setAttr(el, name, value) {
  if (value === null || value === undefined || value === false) {
    if (el.hasAttribute(name)) el.removeAttribute(name)
  } else if (el.getAttribute(name) !== String(value)) {
    el.setAttribute(name, value)
  }
}

function text(el) {
  return (el.textContent || '').replace(/\s+/g, ' ').trim()
}

// Leaf header cell for every column index, resolving colspan/rowspan in multi-row headers.
function headerColumns(table) {
  const grid = []
  const rows = table.tHead ? Array.from(table.tHead.rows) : []
  rows.forEach((row, r) => {
    grid[r] = grid[r] || []
    let c = 0
    for (const cell of row.cells) {
      while (grid[r][c]) c++
      for (let i = 0; i < (cell.colSpan || 1); i++) {
        for (let j = 0; j < (cell.rowSpan || 1); j++) {
          grid[r + j] = grid[r + j] || []
          grid[r + j][c + i] = cell
        }
      }
      c += cell.colSpan || 1
    }
  })
  const leafRow = grid[grid.length - 1] || []
  return leafRow.map((cell, c) => {
    const parts = []
    for (const row of grid) {
      const label = row[c] ? text(row[c]) : ''
      if (label && parts[parts.length - 1] !== label) parts.push(label)
    }
    return { label: parts.join(' – '), role: cell.dataset.col || null }
  })
}

function isActionsCell(cell) {
  const buttons = cell.querySelectorAll('button, [role="button"]')
  if (!buttons.length) return false
  let insideButtons = 0
  buttons.forEach((b) => { insideButtons += (b.textContent || '').replace(/\s+/g, '').length })
  return (cell.textContent || '').replace(/\s+/g, '').length <= insideButtons
}

function isSelectCell(cell) {
  return !!cell.querySelector('input[type="checkbox"]') && !text(cell)
}

function decorate(table) {
  const columns = headerColumns(table)
  for (const body of table.tBodies) {
    for (const row of body.rows) {
      const cells = row.cells
      setAttr(row, 'data-full', cells.length === 1 && columns.length > 1 ? '' : null)
      let c = 0
      for (const cell of cells) {
        const span = cell.colSpan || 1
        const column = span === 1 ? columns[c] : null
        let role = cell.dataset.col || (column && column.role) || null
        if (!role && isActionsCell(cell)) role = 'actions'
        else if (!role && isSelectCell(cell)) role = 'select'
        else if (!role && column && column.label === '#') role = 'index'
        setAttr(cell, 'data-role', role)
        setAttr(cell, 'data-label', !role && column && column.label ? column.label : null)
        setAttr(cell, 'data-wide', span > 1 || text(cell).length > 60 ? '' : null)
        c += span
      }
    }
  }
}

export default {
  mounted: decorate,
  updated: decorate,
}
