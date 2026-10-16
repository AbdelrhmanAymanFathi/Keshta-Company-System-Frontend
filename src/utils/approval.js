// Shared helpers for the maker-checker approval workflow.
// A 202 (or a body with status PENDING) means the change was queued for an
// admin to approve instead of being applied immediately.
export function isPendingApproval(res) {
  const status = res?.status
  const bodyStatus = res?.data?.status ?? res?.body?.status
  return status === 202 || status === 'PENDING' || bodyStatus === 'PENDING'
}

export function pendingApprovalToast(isArabic) {
  return isArabic
    ? 'تم إرسال الطلب إلى الأدمن للموافقة'
    : 'Submitted to admin for approval'
}
