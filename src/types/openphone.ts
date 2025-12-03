export type OpenPhoneNumber = {
  id: string;
  phoneNumber: string;
  formattedNumber: string;
  name?: string;
  createdAt: string;
};

export type OpenPhoneApiResponse = {
  data: OpenPhoneNumber[];
};

export type OpenPhoneContactField = {
  name: string;
  value: string;
};

export type OpenPhoneContact = {
  id: string;
  externalId: string | null;
  defaultFields: {
    firstName?: string | null;
    lastName?: string | null;
    company?: string | null;
    role?: string | null;
    emails?: OpenPhoneContactField[];
    phoneNumbers?: OpenPhoneContactField[];
  };
};

export type OpenPhoneContactPayload = {
  externalId?: string;
  defaultFields: {
    firstName?: string | null;
    lastName?: string | null;
    company?: string | null;
    role?: string | null;
    emails?: OpenPhoneContactField[];
    phoneNumbers?: OpenPhoneContactField[];
  };
};

export type OpenPhoneContactResponse = {
  data: OpenPhoneContact;
};

export type CreateOpenPhoneContactInput = {
  contactId: string;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  phone?: string | null;
  companyName?: string | null;
};

export type UpdateOpenPhoneSettingsInput = {
  openphone_api_key: string | null;
  openphone_phone_number_id: string | null;
  openphone_phone_number: string | null;
  openphone_enabled: boolean;
};
