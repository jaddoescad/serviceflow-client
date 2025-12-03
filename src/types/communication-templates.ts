export type CommunicationTemplateKey =
  | "appointment_confirmation"
  | "proposal_quote"
  | "invoice_send"
  | "invoice_payment_request"
  | "payment_receipt"
  | "work_order_dispatch"
  | "change_order_send"
  | "job_schedule";

export type CommunicationTemplateRecord = {
  id: string;
  company_id: string;
  template_key: CommunicationTemplateKey;
  name: string;
  description: string | null;
  email_subject: string | null;
  email_body: string | null;
  sms_body: string | null;
  created_at: string;
  updated_at: string;
};

export type UpsertCommunicationTemplateInput = {
  company_id: string;
  template_key: CommunicationTemplateKey;
  name?: string;
  description?: string | null;
  email_subject?: string | null;
  email_body?: string | null;
  sms_body?: string | null;
};

export type CommunicationTemplateDefinition = {
  key: CommunicationTemplateKey;
  label: string;
  helpText: string;
  defaultEmailSubject: string;
  defaultEmailBody: string;
  defaultSmsBody: string;
  keywords: string[];
};

export type CommunicationTemplateSnapshot = {
  key: CommunicationTemplateKey;
  name: string;
  description: string | null;
  emailSubject: string;
  emailBody: string;
  smsBody: string;
  updatedAt: string | null;
};
