function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export function openTablePdfExport({ title, headers = [], rows = [], rtl = false }) {
  if (!Array.isArray(headers) || !headers.length || !Array.isArray(rows) || !rows.length) return

  const printWindow = window.open('', '_blank', 'noopener,noreferrer,width=1200,height=800')
  if (!printWindow) return

  const tableHead = headers
    .map((header) => `<th>${escapeHtml(header)}</th>`)
    .join('')

  const tableBody = rows
    .map((row) => {
      const cells = row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')
      return `<tr>${cells}</tr>`
    })
    .join('')

  const html = `<!doctype html>
<html lang="${rtl ? 'ar' : 'en'}" dir="${rtl ? 'rtl' : 'ltr'}">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(title || 'Report')}</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        margin: 24px;
        color: #111827;
      }
      h1 {
        font-size: 20px;
        margin: 0 0 16px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
        table-layout: auto;
      }
      th, td {
        border: 1px solid #d1d5db;
        padding: 8px 10px;
        font-size: 12px;
        text-align: ${rtl ? 'right' : 'left'};
        vertical-align: top;
        word-break: break-word;
      }
      th {
        background: #f3f4f6;
        font-weight: 700;
      }
      tr:nth-child(even) td {
        background: #f9fafb;
      }
      @media print {
        body {
          margin: 12px;
        }
      }
    </style>
  </head>
  <body>
    <h1>${escapeHtml(title || 'Report')}</h1>
    <table>
      <thead><tr>${tableHead}</tr></thead>
      <tbody>${tableBody}</tbody>
    </table>
  </body>
</html>`

  printWindow.document.open()
  printWindow.document.write(html)
  printWindow.document.close()
  printWindow.focus()
  printWindow.onload = () => {
    printWindow.print()
  }
}
