export type TwilioNumber = {
  id: string;
  phoneNumber: string;
  formattedNumber: string;
  name?: string;
  createdAt?: string;
};

export type UpdateTwilioSettingsInput = {
  twilio_account_sid: string | null;
  twilio_auth_token: string | null;
  twilio_phone_number: string | null;
  twilio_enabled: boolean;
};

