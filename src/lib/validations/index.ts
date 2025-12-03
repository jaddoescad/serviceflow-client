// Common schemas
export {
  nameSchema,
  optionalNameSchema,
  emailSchema,
  optionalEmailSchema,
  phoneSchema,
  optionalPhoneSchema,
  urlSchema,
  optionalUrlSchema,
  dateSchema,
  timeSchema,
  currencySchema,
  contactSchema,
  addressSchema,
  companySettingsSchema,
  type ContactFormValues,
  type AddressFormValues,
  type CompanySettingsFormValues,
} from "./common";

// Schedule deal schemas
export {
  scheduleDealFormSchema,
  addressFormSchema,
  fullScheduleDealSchema,
  communicationMethodSchema,
  type ScheduleDealFormValues,
  type AddressFormValues as ScheduleDealAddressValues,
  type FullScheduleDealFormValues,
} from "./schedule-deal";
