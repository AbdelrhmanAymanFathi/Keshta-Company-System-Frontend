# Backend Fix: Rental Report API (500 Error)

## المشكلة
الـ Backend يرجع **HTTP 500 Internal Server Error** عند استدعاء:
```
GET /api/rentals/report?startDate=2025-10-16&endDate=2025-11-15
```

## الأسباب المحتملة
1. Query parameters غير مُعالَجة بشكل صحيح (null/undefined values).
2. استعلام قاعدة البيانات (DB query) فاشل أو بناء الـ WHERE clause خاطئ.
3. تنسيق التاريخ مختلف (YYYY-MM-DD vs ISO format vs Unix timestamp).
4. صلاحيات/authentication issue — لكن لا، التوكن يُرسَل بشكل صحيح.
5. Route conflicting — route خاطئ أو معرّف تحتها.

## الحل: Express/Node Sample

افترض أن الـ Backend استخدم **Express.js** مع **Sequelize** أو **TypeORM** أو raw SQL. إليك نموذج صحيح:

### Option 1: Express + Sequelize (أكثر شيوعاً)

```javascript
// backend/routes/rentals.js (or rentals.controller.js)

const express = require('express');
const router = express.Router();
const { Rental } = require('../models'); // Sequelize model
const { authenticateToken } = require('../middleware/auth');
const { Op } = require('sequelize');

/**
 * GET /api/rentals/report
 * Query Params:
 *   - startDate (YYYY-MM-DD) required
 *   - endDate (YYYY-MM-DD) required
 *   - q (search string) optional
 *   - isCompanyOwned (true/false) optional
 * Returns: JSON with { items: [...], total, totalPaid, totalRemaining }
 */
router.get('/report', authenticateToken, async (req, res) => {
  try {
    console.log('Rental report request:', req.query);

    const { startDate, endDate, q, isCompanyOwned } = req.query;

    // Validation
    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }

    // Build WHERE clause
    const where = {
      createdAt: {
        [Op.gte]: new Date(startDate + 'T00:00:00Z'), // Start of day
        [Op.lte]: new Date(endDate + 'T23:59:59Z')    // End of day
      }
    };

    // Add optional filters
    if (q) {
      where[Op.or] = [
        { equipment: { [Op.like]: `%${q}%` } },
        { name: { [Op.like]: `%${q}%` } }
      ];
    }

    if (typeof isCompanyOwned !== 'undefined') {
      where.isCompanyOwned = isCompanyOwned === 'true' || isCompanyOwned === true;
    }

    // Fetch rentals
    const rentals = await Rental.findAll({
      where,
      order: [['createdAt', 'DESC']],
      attributes: [
        'id', 'date', 'equipment', 'name', 'hours', 'hourlyRate',
        'total', 'paidAmount', 'isCompanyOwned', 'createdAt'
      ]
    });

    // Calculate totals
    const totalAmount = rentals.reduce((sum, r) => sum + (parseFloat(r.total) || 0), 0);
    const totalPaid = rentals.reduce((sum, r) => sum + (parseFloat(r.paidAmount) || 0), 0);

    // Return JSON (not binary)
    return res.json({
      items: rentals,
      total: totalAmount,
      totalPaid: totalPaid,
      totalRemaining: totalAmount - totalPaid,
      count: rentals.length
    });

  } catch (error) {
    console.error('Error generating rental report:', error);
    return res.status(500).json({
      message: 'Failed to generate rental report',
      error: error.message // Remove in production for security
    });
  }
});

module.exports = router;
```

### Option 2: Express + Raw SQL

```javascript
router.get('/report', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, q, isCompanyOwned } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate are required' });
    }

    let query = `
      SELECT id, date, equipment, name, hours, hourlyRate, total, paidAmount, isCompanyOwned
      FROM rentals
      WHERE DATE(createdAt) BETWEEN ? AND ?
    `;
    const params = [startDate, endDate];

    if (q) {
      query += ` AND (equipment LIKE ? OR name LIKE ?)`;
      params.push(`%${q}%`, `%${q}%`);
    }

    if (typeof isCompanyOwned !== 'undefined') {
      query += ` AND isCompanyOwned = ?`;
      params.push(isCompanyOwned === 'true' ? 1 : 0);
    }

    query += ` ORDER BY createdAt DESC`;

    const db = require('../db'); // or your connection pool
    const rentals = await db.query(query, params);

    const totalAmount = rentals.reduce((sum, r) => sum + parseFloat(r.total || 0), 0);
    const totalPaid = rentals.reduce((sum, r) => sum + parseFloat(r.paidAmount || 0), 0);

    res.json({
      items: rentals,
      total: totalAmount,
      totalPaid: totalPaid,
      totalRemaining: totalAmount - totalPaid,
      count: rentals.length
    });

  } catch (error) {
    console.error('Rental report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
```

### Option 3: If you want to support both JSON and Excel download

```javascript
router.get('/report', authenticateToken, async (req, res) => {
  try {
    const { startDate, endDate, q, isCompanyOwned, download } = req.query;

    if (!startDate || !endDate) {
      return res.status(400).json({ message: 'startDate and endDate required' });
    }

    // ... [fetch rentals as above] ...

    // If download=true, return Excel
    if (download === 'true') {
      const ExcelJS = require('exceljs');
      const workbook = new ExcelJS.Workbook();
      const sheet = workbook.addWorksheet('Rentals');

      sheet.columns = [
        { header: 'Date', key: 'date', width: 12 },
        { header: 'Equipment', key: 'equipment', width: 20 },
        { header: 'Name', key: 'name', width: 15 },
        { header: 'Hours', key: 'hours', width: 8 },
        { header: 'Rate', key: 'hourlyRate', width: 10 },
        { header: 'Total', key: 'total', width: 12 },
        { header: 'Paid', key: 'paidAmount', width: 12 }
      ];

      rentals.forEach(r => sheet.addRow(r));

      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', `attachment; filename="rentals-${startDate}_${endDate}.xlsx"`);

      return workbook.xlsx.write(res);
    }

    // Default: return JSON
    res.json({
      items: rentals,
      total: totalAmount,
      totalPaid: totalPaid,
      totalRemaining: totalAmount - totalPaid
    });

  } catch (error) {
    console.error('Report error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});
```

## Debug Steps

### 1. Check Backend Logs
```bash
# In your backend terminal or log file
tail -f logs/error.log
# or if using PM2:
pm2 logs
```

### 2. Check Query Parameters Are Received
Add console.log to see what params come in:
```javascript
router.get('/report', (req, res) => {
  console.log('Query params received:', JSON.stringify(req.query));
  // ...
});
```

### 3. Test with curl
```bash
curl -v -H "Authorization: Bearer $TOKEN" \
  "http://38.242.152.149:8080/api/rentals/report?startDate=2025-10-16&endDate=2025-11-15"
```

Should return JSON like:
```json
{
  "items": [
    {
      "id": 1,
      "date": "2025-10-16",
      "equipment": "excavator",
      "name": "John",
      "hours": 8,
      "hourlyRate": 100,
      "total": 800,
      "paidAmount": 500
    }
  ],
  "total": 800,
  "totalPaid": 500,
  "totalRemaining": 300,
  "count": 1
}
```

## Common Issues & Fixes

| Issue | Fix |
|-------|-----|
| `startDate is undefined` | Validate `req.query.startDate` not null |
| `Invalid date format` | Ensure dates are `YYYY-MM-DD` format |
| `Table doesn't exist` | Check table name: `rentals` vs `rental` |
| `Column not found` | Map response field names to DB columns |
| `isCompanyOwned comparison fails` | Convert string `'true'` to boolean before query |
| `HEAD method not allowed` | Add `router.head('/report', ...)` or disable HEAD on frontend |

## Next Steps

1. **Add this route to your backend** and restart the server.
2. **Test with curl** to verify JSON response (not 500).
3. **Frontend will auto-detect** JSON and display it in the table.
4. **If you want Excel download**, add `download=true` param and implement Option 3 above.

## Frontend Update (if needed)

No changes needed if backend returns JSON by default. If backend returns Excel unconditionally, uncomment the Excel parsing in `getRentalReportData`.
