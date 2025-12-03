# Multi-Organization Support Migration Guide

This document outlines the changes made to support multiple organizations per user in ServiceFlow.

## Overview

The application has been restructured to allow a single user to create and belong to multiple organizations (companies). Previously, each user was tied to a single company through a one-to-one relationship. Now, users can:

- Sign up and create an account
- Create multiple organizations
- Switch between organizations
- Be invited to join other organizations

## Architecture Changes

### Database Schema Changes

**Migration File**: `supabase/migrations/202511150002_multi_organization_support.sql`

#### Key Changes:

1. **Users Table**
   - Added `current_company_id` column to track which organization the user is currently viewing
   - Added index on `current_company_id` for performance

2. **Companies Table**
   - Removed the `UNIQUE` constraint on `user_id` to allow multiple companies per user
   - `user_id` is now nullable and kept for backwards compatibility
   - Updated RLS policies to work exclusively with `company_members` table

3. **Company Members Table**
   - Now serves as the single source of truth for user-organization relationships
   - Many-to-many relationship between users and companies

4. **Updated Functions**
   - `ensure_creator_membership()` - Creates membership when company is created (only if user_id is provided)
   - `is_company_member()` - Simplified to only check company_members table
   - `user_company_role()` - Returns role from company_members table

5. **Updated Policies**
   - Companies: Anyone authenticated can create, members can view, admins can update
   - All other tables continue to use `is_company_member()` and `is_company_admin()` functions

### Application Changes

#### 1. Types (`src/types/`)

**company.ts**:
- Updated `CreateCompanyInput` to make `user_id` nullable
- Added `CreateOrganizationInput` type for new organization creation flow

**users.ts**:
- Added `current_company_id` field to `UserProfileRecord`

#### 2. Repositories

**companies.ts**:
- Updated `getCompanyForUser()` to:
  - First check user's `current_company_id`
  - Fall back to first company membership if no current company set
  - Auto-update `current_company_id` on first access

**companies.client.ts**:
- Added `createOrganization()` function that:
  - Creates a company without tying it to a single user
  - Creates admin membership for the creator
  - Sets the new company as the user's current organization

**company-members.ts**:
- Added `listUserOrganizations()` to fetch all organizations a user belongs to

**users.client.ts** (new):
- Added `switchCurrentOrganization()` to change user's active organization

#### 3. UI Components

**organization-switcher.tsx** (new):
- Dropdown component showing current organization
- Allows switching between organizations
- Link to create new organization
- Shows organization name, role, and visual indicator for current org

**site-header.tsx**:
- Updated to accept `organizationSwitcher` prop
- Displays organization switcher in header navigation

**company-setup-form.tsx**:
- Updated to use `createOrganization()` instead of `createCompany()`
- Changed UI text to reflect "organization" terminology

#### 4. Pages & Layouts

**app/(dashboard)/layout.tsx**:
- Now server component that fetches:
  - User authentication
  - User's current company
  - List of all user's organizations
- Passes data to OrganizationSwitcher component

**app/company/profile/page.tsx**:
- Simplified to always allow creating new organizations
- Removed redirect for existing companies

## User Flow

### New User Onboarding

1. User signs up at `/login` (creates account in `auth.users` and `public.users`)
2. User is redirected to dashboard
3. Dashboard checks for organizations via `getCompanyForUser()`
4. If no organizations, user is redirected to `/company/profile`
5. User fills out organization creation form
6. Organization is created with user as admin
7. User is set to that organization and redirected to dashboard

### Switching Organizations

1. User clicks organization name in header
2. Dropdown shows all organizations user belongs to
3. User selects different organization
4. Repository helper updates `users.current_company_id`
5. Page refreshes with new organization context

### Creating Additional Organizations

1. User clicks "Create new organization" in organization switcher
2. Navigates to `/company/profile`
3. Fills out form and creates new organization
4. New organization becomes the active organization
5. User is redirected to dashboard

## Migration Steps

To deploy these changes:

1. **Run Database Migration**
   ```bash
   # This will be automatically applied by Supabase
   supabase db push
   ```

2. **Deploy Application Code**
   - All repository functions are backwards compatible
   - Existing data will continue to work (old companies with user_id)
   - New organizations will be created without user_id

3. **Data Migration** (automatic)
   - Migration automatically sets `current_company_id` for existing users based on their first company membership

## Backwards Compatibility

The changes are designed to be backwards compatible:

1. Existing companies with `user_id` set will continue to work
2. The migration creates company_members entries for all existing companies
3. Functions check both company_members and legacy user_id patterns
4. RLS policies prioritize company_members but fall back to user_id checks where needed

## Testing Checklist

- [ ] New user can sign up and create first organization
- [ ] User can create additional organizations
- [ ] User can switch between organizations
- [ ] Organization data is properly isolated per organization
- [ ] Organization switcher displays correct current organization
- [ ] Existing users with old data structure still work
- [ ] RLS policies properly restrict data access per organization
- [ ] All API endpoints require authentication
- [ ] Organization switching validates membership

## Future Enhancements

Potential improvements to consider:

1. **Organization Invitations**: Allow admins to invite users to join their organization
2. **Organization Settings**: Per-organization billing, team size limits, etc.
3. **Default Organization**: Allow users to set a default organization
4. **Organization Removal**: Allow users to leave organizations (except last one)
5. **Role Management**: More granular permission system per organization
6. **Audit Logging**: Track organization switches and membership changes

## Rollback Plan

If issues arise, you can rollback by:

1. Reverting the application code to previous version
2. Running a rollback migration that:
   - Restores UNIQUE constraint on companies.user_id
   - Reverts RLS policy changes
   - Removes current_company_id from users table

Note: New organizations created after migration would need manual cleanup.
