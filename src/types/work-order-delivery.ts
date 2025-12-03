export type WorkOrderDeliveryMethod = "email" | "text" | "both";

export type WorkOrderDeliveryRequestPayload = {
  method: WorkOrderDeliveryMethod;
  variant: "standard" | "secret";
  email?: {
    to: string;
    subject: string;
    body: string;
    cc?: string | null;
  } | null;
  text?: {
    to: string;
    body: string;
  } | null;
};

export type WorkOrderDeliveryResponsePayload = {
  sentEmail: boolean;
  sentText: boolean;
};
