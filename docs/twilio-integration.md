# Twilio Integration

## Overview

This document describes the Twilio integration that allows ServiceFlow to send SMS using a connected Twilio account.

## What Was Implemented

### 1. Database Schema

Added the following fields to the `companies` table:

- `twilio_account_sid` (text) - Twilio Account SID
- `twilio_auth_token` (text) - Twilio Auth Token
- `twilio_phone_number` (text) - Selected sender phone number (E.164)
- `twilio_enabled` (boolean) - Enables/disables the integration

See migration: `server/supabase/migrations/20251212000000_replace_openphone_with_twilio.sql`.

### 2. TypeScript Types

Files updated:

- `client/src/types/company.ts`
- `client/src/features/companies/types.ts`
- `client/src/types/twilio.ts`

### 3. API Endpoints

Twilio settings and number lookup endpoints:

- `POST /integrations/twilio/test` — test credentials before saving
- `POST /integrations/twilio/numbers` — list available Twilio numbers
- `GET /companies/:id/twilio/test` — test stored credentials
- `GET /companies/:id/twilio/numbers` — list stored-account numbers
- `PATCH /companies/:id/twilio/settings` — save company Twilio settings

### 4. UI Component

**File**: `client/src/components/company/company-twilio-settings-section.tsx`

Allows users to:

- Enter Twilio Account SID and Auth Token
- Test the connection
- Select a Twilio phone number
- Enable/disable SMS sending

## How to Use

1. In Twilio Console, copy your Account SID and Auth Token.
2. In ServiceFlow, go to **Company Settings → Phone Settings**.
3. Paste SID and token, click **Test**.
4. Choose a phone number from the dropdown.
5. Enable the integration and save.

