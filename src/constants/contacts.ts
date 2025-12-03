import { CONTACT_ADDRESS_FIELDS } from "@/constants/contact-addresses";

export const CONTACT_FIELDS = [
  "id",
  "company_id",
  "first_name",
  "last_name",
  "email",
  "phone",
  "created_at",
  "updated_at",
  `addresses:contact_addresses(${CONTACT_ADDRESS_FIELDS})`,
].join(", ");
