export const GMAIL_SEND_SCOPE = "https://www.googleapis.com/auth/gmail.send";
export const GMAIL_READONLY_SCOPE = "https://www.googleapis.com/auth/gmail.readonly";
export const GMAIL_USERINFO_SCOPE = "https://www.googleapis.com/auth/userinfo.email";

export const GMAIL_OAUTH_SCOPES = [
  GMAIL_SEND_SCOPE,
  GMAIL_READONLY_SCOPE,
  GMAIL_USERINFO_SCOPE,
] as const;
