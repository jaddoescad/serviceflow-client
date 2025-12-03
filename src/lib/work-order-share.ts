export const getBrowserWorkOrderShareUrl = (shareId: string | null, origin?: string) => {
  if (!shareId) return null;
  const effectiveOrigin = origin || (typeof window !== 'undefined' ? window.location.origin : '');
  if (!effectiveOrigin) return '';
  return `${effectiveOrigin}/workorders/details/${shareId}`;
};

export const getBrowserSecretWorkOrderShareUrl = (shareId: string | null, origin?: string) => {
  if (!shareId) return null;
  const effectiveOrigin = origin || (typeof window !== 'undefined' ? window.location.origin : '');
  if (!effectiveOrigin) return '';
  return `${effectiveOrigin}/workorders/secret/${shareId}`;
};