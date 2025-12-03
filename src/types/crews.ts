export type CrewRecord = {
  id: string;
  company_id: string;
  created_by_user_id: string;
  name: string;
  created_at: string;
  updated_at: string;
};

export type CrewSummary = Pick<CrewRecord, "id" | "name">;

export type CreateCrewInput = {
  companyId: string;
  name: string;
};

export type UpdateCrewInput = {
  name: string;
};
