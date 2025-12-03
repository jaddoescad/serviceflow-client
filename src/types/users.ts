export type UserProfileRecord = {
  id: string;
  email: string;
  display_name: string | null;
  first_name: string | null;
  last_name: string | null;
  phone_number: string | null;
  invited_at: string | null;
  current_company_id: string | null;
  created_at: string;
  updated_at: string;
};

export type UpsertUserProfileInput = {
  id: string;
  email: string;
  display_name?: string | null;
  first_name?: string | null;
  last_name?: string | null;
  phone_number?: string | null;
  invited_at?: string | null;
};

export type UpdateUserProfileInput = Partial<Omit<UpsertUserProfileInput, "id" | "email">> & {
  id: string;
};
