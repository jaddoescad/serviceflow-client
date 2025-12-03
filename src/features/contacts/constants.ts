export const CONTACT_ADDRESS_FIELDS = [
  "id",
  "contact_id",
  "address_line1",
  "address_line2",
  "city",
  "state",
  "postal_code",
  "country",
  "created_at",
  "updated_at",
].join(", ");

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
