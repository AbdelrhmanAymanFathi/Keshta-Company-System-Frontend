# Backend Pagination Requirements

## Overview
The frontend has been updated to support pagination for all list endpoints. The following API endpoints need to support pagination parameters.

## Required Endpoints

### 1. Transports List
**Endpoint:** `GET /api/transports`

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `pageSize` (number, default: 20) - Items per page
- `q` (string, optional) - Search query

**Expected Response:**
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "pageSize": 20
}
```

### 2. Deliveries/Supplies List
**Endpoint:** `GET /api/exports`

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `pageSize` (number, default: 20) - Items per page
- `q` (string, optional) - Search query

**Expected Response:**
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "pageSize": 20
}
```

### 3. Crushers List
**Endpoint:** `GET /api/crushers`

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `pageSize` (number, default: 20) - Items per page
- `q` (string, optional) - Search query

**Expected Response:**
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "pageSize": 20
}
```

### 4. Contractors List
**Endpoint:** `GET /api/contractors`

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `pageSize` (number, default: 20) - Items per page
- `q` (string, optional) - Search query

**Expected Response:**
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "pageSize": 20
}
```

### 5. Vehicles List
**Endpoint:** `GET /api/vehicles`

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `pageSize` (number, default: 20) - Items per page
- `q` (string, optional) - Search query

**Expected Response:**
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "pageSize": 20
}
```

### 6. Drivers List
**Endpoint:** `GET /api/drivers`

**Query Parameters:**
- `page` (number, default: 1) - Page number
- `pageSize` (number, default: 20) - Items per page
- `q` (string, optional) - Search query
- `contractorId` (number, optional) - Filter by contractor ID

**Expected Response:**
```json
{
  "items": [...],
  "total": 100,
  "page": 1,
  "pageSize": 20
}
```

## Response Format

All paginated endpoints should return:
- `items` (array) - Array of items for the current page
- `total` (number) - Total number of items across all pages
- `page` (number) - Current page number
- `pageSize` (number) - Number of items per page

## Notes

- If pagination is not yet implemented on the backend, the frontend will gracefully handle the response by:
  - Treating the entire response array as `items` if the response is a plain array
  - Extracting `items` from the response object if it exists
  - Defaulting `total` to the length of items if not provided

- The frontend will send pagination parameters even if the backend doesn't support them yet, so the backend can ignore them until implementation is complete.

- Search parameter `q` should filter results based on relevant fields (e.g., name, phone, etc.) before pagination is applied.

## Implementation Priority

All endpoints listed above should support pagination to ensure consistent user experience and performance, especially as data volumes grow.

