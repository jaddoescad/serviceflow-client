import type { CompanyMemberRole } from "@/types/company-members";

export const COMPANY_MEMBER_FIELDS = [
  "id",
  "company_id",
  "user_id",
  "email",
  "display_name",
  "role",
  "created_at",
  "updated_at",
].join(", ");

export type CompanyMemberRoleOption = {
  value: CompanyMemberRole;
  label: string;
  disabled?: boolean;
};

export const COMPANY_MEMBER_ROLE_OPTIONS: readonly CompanyMemberRoleOption[] = [
  { value: "admin", label: "Admin" },
  { value: "sales", label: "Sales" },
  { value: "project_manager", label: "Project Manager", disabled: true },
];
