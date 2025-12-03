# Gmail Email Setup

This guide explains how to connect a customer's Gmail or Google Workspace mailbox so proposal emails are delivered from their account (and appear in their Sent folder).

## Prerequisites

- Google Cloud project with the Gmail API enabled.
- OAuth 2.0 client credentials configured as a **Web application**.
- Environment variables set in the app runtime:
  - `GOOGLE_OAUTH_CLIENT_ID`
  - `GOOGLE_OAUTH_CLIENT_SECRET`
  - `APP_URL` (or `VITE_APP_URL`) pointing to the deployed app origin.
- `SUPABASE_SERVICE_ROLE_KEY` must be configured so the API routes can persist refresh tokens safely.

## User Flow

1. Navigate to **Company → Settings → Email Settings**.
2. Click **Connect Gmail**. This redirects the admin to Google's consent screen.
3. Approve the `gmail.send`, `gmail.readonly`, and `userinfo.email` scopes. We request offline access so a refresh token is issued.
4. After redirect back to the app, `company_email_settings` is updated with the Gmail account metadata and `company_email_credentials` stores the refresh/access tokens.
5. Proposal emails now send via the Gmail API using the connected account.

## Data Model Overview

- `company_email_settings`
  - `provider` is set to `gmail` when connected.
  - `provider_account_email` records the mailbox we are sending from.
  - `status` reflects the current connection state (`connected`, `error`, `disconnected`).
- `company_email_credentials`
  - Holds the refresh token, latest access token, expiry, and granted scopes.
  - Never expose this table directly to the client; the service role client is used on the server to read/write tokens.

## Common Maintenance Tasks

- **Disconnected mailbox:** Click **Connect Gmail** again. The callback overwrites the stored tokens and resets the status to `connected`.
- **Force reset:** Use the **Disconnect Gmail** button. This clears tokens and status so the customer can reconnect a different mailbox.
- **Revoked consent or 401 responses:** The send route marks the status as `error` and instructs the customer to reconnect. No manual cleanup is required.

## Manual QA Checklist

- Connect a test Gmail/Workspace account and confirm the UI shows "Sending from ... via Gmail".
- Send a proposal with Email selected. Verify the message:
  - Arrives in the recipient inbox.
  - Appears in the sender's Gmail Sent folder.
  - Has the configured Reply-To and optional BCC headers.
- Disconnect Gmail and confirm proposals cannot be emailed until a new connection is established.
