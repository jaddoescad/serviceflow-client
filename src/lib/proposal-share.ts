// URL for customer-facing proposal (sent via email/SMS) - always shows approval options
export const getBrowserProposalShareUrl = (shareId: string | null, origin?: string) => {
  if (!shareId) return null;
  const effectiveOrigin = origin || (typeof window !== 'undefined' ? window.location.origin : '');
  if (!effectiveOrigin) return '';
  return `${effectiveOrigin}/p/${shareId}`;
};

// URL for employee preview of customer view - shows "Employee View" notice when logged in
export const getEmployeeProposalPreviewUrl = (shareId: string | null, origin?: string) => {
  if (!shareId) return null;
  const effectiveOrigin = origin || (typeof window !== 'undefined' ? window.location.origin : '');
  if (!effectiveOrigin) return '';
  return `${effectiveOrigin}/proposals/${shareId}`;
};