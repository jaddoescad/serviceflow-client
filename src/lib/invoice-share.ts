export const getBrowserInvoiceShareUrl = (shareId: string) => {
  const envOrigin = import.meta.env.VITE_APP_URL?.replace(/\/+$/, '');

  // Use a deterministic origin for SSR to avoid hydration mismatches.
  const relativePath = `/invoices/${shareId}`;
  if (envOrigin) {
    return `${envOrigin}${relativePath}`;
  }
  return relativePath;
};
