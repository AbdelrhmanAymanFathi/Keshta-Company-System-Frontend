# Auth API — Front-end Examples

Quick copy-paste examples for the authentication endpoints used by the front-end.

General
- Include the access token in `Authorization: Bearer <token>` for protected endpoints.
- All request bodies are JSON; send header `Content-Type: application/json`.
- Many endpoints return `204 No Content` on success — treat 200/204 as success where noted.

---

## 1) Admin: Reset user password
- URL: `POST /api/auth/admin/users/:id/reset`
- Auth: admin access token
- Body: `{ "newPassword": "NewPass123!", "adminTotp": "123456" }` (`adminTotp` optional)
- Success: `204 No Content`

Fetch example:

```js
const res = await fetch(`/api/auth/admin/users/${userId}/reset`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${adminToken}`,
  },
  body: JSON.stringify({ newPassword: 'NewPass123!', adminTotp: '123456' }),
});
if (res.status === 204) {
  // success
} else {
  const err = await res.json().catch(()=>({}));
  throw new Error(err.message || `Request failed: ${res.status}`);
}
```

curl example:

```bash
curl -X POST "http://localhost:3000/api/auth/admin/users/42/reset" \
  -H "Authorization: Bearer <ADMIN_TOKEN>" \
  -H "Content-Type: application/json" \
  -d '{"newPassword":"NewPass123!","adminTotp":"123456"}'
```

---

## 2) Request password reset (send email)
- URL: `POST /api/auth/password/request`
- Auth: none
- Body: `{ "email": "alice@example.com" }`
- Success: `204 No Content` (treat as generic "email sent")

Fetch example:

```js
await fetch('/api/auth/password/request', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'alice@example.com' })
});
// Show generic success message regardless of existence
```

---

## 3) Verify reset token & set new password
- URL: `POST /api/auth/password/verify`
- Auth: none
- Body: `{ "token": "<RESET_TOKEN>", "newPassword": "s3cret123", "totp": "123456" }` (`totp` optional)
- Success: `204 No Content`

Fetch example:

```js
const res = await fetch('/api/auth/password/verify', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ token, newPassword: 's3cret123', totp: '123456' })
});
if (res.status === 204) { /* success */ }
else { /* handle error */ }
```

---

## 4) Start TOTP device registration
- URL: `POST /api/auth/totp/register`
- Auth: required (Bearer token)
- Body: `{ "label": "Alice's iPhone" }` (optional)
- Success: `200 JSON` e.g.
  `{ "secret": "BASE32", "otpauthUrl": "otpauth://...", "qr": "data:image/png;base64,..." }`

Fetch example:

```js
const res = await fetch('/api/auth/totp/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ label: "Alice's iPhone" })
});
const data = await res.json();
// data.qr => <img src={data.qr} />
// data.secret => show for backup
```

---

## 5) Confirm TOTP device registration
- URL: `POST /api/auth/totp/confirm`
- Auth: required
- Body (server expects): `{ "secret": "BASE32", "token": "123456", "label": "Alice's iPhone" }`
- Success: `201 JSON: { "device": { id, label, createdAt, lastUsedAt } }`

Fetch example:

```js
const res = await fetch('/api/auth/totp/confirm', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
  body: JSON.stringify({ secret, token: '123456', label: "Alice's iPhone" })
});
if (res.status === 201) {
  const { device } = await res.json();
  // show success and update device list
}
```

---

## Error handling tips
- 401/403: show auth error and prompt login.
- 400/422: show validation errors.
- 404: resource not found.
- For password reset request, always show a generic "If an account exists, a reset was sent" message to avoid user enumeration.

## UI tips
- For admin reset, use a confirmation modal and require admin TOTP if prompted.
- After password reset success, redirect to login and show a success message.
- After TOTP start: show the QR (`qr` or generated from `otpauthUrl`), display the secret for backup, show a TTL countdown if provided, and provide a confirm input for the 6-digit token.

---

If you'd like, I can add a small Vue component example showing the full TOTP flow (start → display QR + secret → confirm → refresh device list).
