export type DealNoteRow = {
  id: string;
  company_id: string;
  deal_id: string;
  author_user_id: string;
  body: string;
  created_at: string;
  updated_at: string;
};

export type DealNoteRecord = Pick<DealNoteRow, "id" | "author_user_id" | "body" | "created_at" | "updated_at">;

export type DealNoteWithAuthor = Pick<DealNoteRecord, "id" | "body" | "created_at"> & {
  author_user_id: string;
  author: string;
};
