# OpenPhone Integration

## Overview

This document describes the OpenPhone integration that allows your ServiceFlow app to connect with OpenPhone's API for making calls and sending SMS.

## What Was Implemented

### 1. Database Schema

**Migration**: `supabase/migrations/202511150001_add_openphone_integration.sql`

Added the following fields to the `companies` table:
- `openphone_api_key` (text) - Stores the OpenPhone API key
- `openphone_phone_number_id` (text) - Stores the selected phone number ID
- `openphone_phone_number` (text) - Stores the formatted phone number
- `openphone_enabled` (boolean) - Enables/disables the integration

### 2. TypeScript Types

**Files Modified**:
- `src/types/company.ts` - Added OpenPhone fields to `CompanyRecord` and `CompanySettingsRecord`
- `src/types/openphone.ts` (new) - Defines OpenPhone-specific types

**Key Types**:
```typescript
export type OpenPhoneNumber = {
  id: string;
  phoneNumber: string;
  formattedNumber: string;
  name?: string;
  createdAt: string;
};

export type UpdateOpenPhoneSettingsInput = {
  openphone_api_key: string | null;
  openphone_phone_number_id: string | null;
  openphone_phone_number: string | null;
  openphone_enabled: boolean;
};
```

### 3. Repository Functions

**File**: `src/repositories/openphone.client.ts`

Provides three main functions:
- `fetchOpenPhoneNumbers(apiKey)` - Fetches available phone numbers from OpenPhone API
- `updateOpenPhoneSettings(supabase, companyId, payload)` - Updates company OpenPhone settings
- `testOpenPhoneConnection(apiKey)` - Tests if the API key is valid

### 4. UI Component

**File**: `src/components/company/company-openphone-settings-section.tsx`

A comprehensive settings panel that allows users to:
- Enter and test their OpenPhone API key
- View connection status (Connected/Disconnected/Not Configured)
- Select from available phone numbers
- Enable/disable the integration
- See helpful instructions

### 5. Settings Page Integration

**File Modified**: `src/app/(dashboard)/company/settings/page.tsx`

Added a new "Phone Settings" tab to the company settings page navigation.

## How to Use

### Step 1: Get Your OpenPhone API Key

1. Log in to your OpenPhone account
2. Navigate to [Settings > API](https://app.openphone.com/settings/api)
3. Generate a new API key
4. Copy the API key (you'll need Owner or Admin role)

### Step 2: Configure in ServiceFlow

1. Navigate to **Company Settings** in your ServiceFlow dashboard
2. Click on the **Phone Settings** tab
3. Paste your OpenPhone API key in the "OpenPhone API Key" field
4. Click **Test** to verify the connection
5. Once verified, select a phone number from the dropdown
6. Check **Enable OpenPhone integration** checkbox
7. Click **Save Settings**

### Step 3: Using OpenPhone Features

Once configured, your app will have access to:
- The selected phone number for outbound calls
- SMS capabilities through OpenPhone
- Automatic contact creation in OpenPhone for every CRM contact
- Call history and logs

#### Automatic Contact Sync

- `createContact` now calls the `/api/openphone/contacts` route after it writes to Supabase.
- The API route re-validates the actor, loads the stored OpenPhone API key, and submits a `POST https://api.openphone.com/v1/contacts` request that includes the CRM contact ID as `externalId`.
- When OpenPhone is disabled (or missing a key) the sync call is skipped; otherwise, errors from OpenPhone abort the CRM insert and keep both systems consistent.

## API Reference

### OpenPhone API Endpoint

The integration uses the following OpenPhone API endpoint:

```
GET https://api.openphone.com/v1/phone-numbers
```

**Headers**:
- `Authorization`: Your OpenPhone API key
- `Content-Type`: application/json

**Response**:
```json
{
  "data": [
    {
      "id": "string",
      "phoneNumber": "string",
      "formattedNumber": "string",
      "name": "string",
      "createdAt": "string"
    }
  ]
}
```

## Security Considerations

1. **API Key Storage**: The API key is stored encrypted in your database
2. **Access Control**: Only company admins can view/modify OpenPhone settings
3. **Connection Testing**: The app validates the API key before saving
4. **Error Handling**: Clear error messages for invalid credentials or connection issues

## Troubleshooting

### "Invalid API key" Error

- Verify you copied the entire API key
- Ensure your OpenPhone account has Owner or Admin role
- Check if the API key hasn't expired

### No Phone Numbers Showing

- Confirm your OpenPhone account has active phone numbers
- Test the connection first before expecting to see numbers
- Check network connectivity

### Changes Not Saving

- Ensure you clicked "Save Settings" button
- Check for error messages at the bottom of the form
- Verify you're logged in as a company admin

## Future Enhancements

Potential features to add:
- Make outbound calls from deal pages
- Send SMS to contacts
- View call history
- Integrate voicemail
- Click-to-call functionality
- SMS templates

## Database Migration

To apply the migration:

```bash
# For local development (requires Docker)
npx supabase db reset --local

# For production
npx supabase db push
```

## Testing

To test the integration:

1. Ensure your local development environment is running
2. Navigate to `http://localhost:3000/company/settings?section=phone`
3. Enter a valid OpenPhone API key
4. Test the connection
5. Select a phone number
6. Enable and save

## Constants Updated

**File**: `src/constants/company.ts`

Updated `COMPANY_SETTINGS_FIELDS` and `COMPANY_SETTINGS_DEFAULTS` to include OpenPhone fields for consistent data handling across the app.

## Code Quality

All code follows the project's established patterns:
- Repository pattern for data access
- Client components for interactive UI
- Server components for data fetching
- TypeScript for type safety
- Tailwind CSS for styling
- Error handling and loading states

## Support

For OpenPhone API documentation, visit:
- [OpenPhone API Docs](https://support.openphone.com/hc/en-us/articles/11718835854999-Does-OpenPhone-have-an-API)
- [OpenPhone Support](https://support.openphone.com/)
