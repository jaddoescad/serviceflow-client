export const parseInviteFragment = (fragment: string) => {
  // Basic placeholder
  const params = new URLSearchParams(fragment.replace(/^#/, ""));
  return {
    accessToken: params.get("access_token"),
    refreshToken: params.get("refresh_token"),
    type: params.get("type"),
  };
};

export const clearUrlFragment = () => {
  if (typeof window !== "undefined") {
    window.history.replaceState(null, "", window.location.pathname);
  }
};
