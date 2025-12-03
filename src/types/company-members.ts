export type CompanyMemberRole = "admin" | "sales" | "project_manager";

export type CompanyMemberRecord = {
  id: string;
  company_id: string;
  user_id: string;
  email: string;
  display_name: string;
  role: CompanyMemberRole;
  created_at: string;
  updated_at: string;
};

export type CreateCompanyMemberInput = {
  company_id: string;
  user_id: string;
  email: string;
  display_name: string;
  role: CompanyMemberRole;
};

export type InviteCompanyMemberPayload = {
  email: string;
  displayName: string;
  role: Exclude<CompanyMemberRole, "project_manager">;
};
