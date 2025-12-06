import { COMMUNICATION_TEMPLATE_DEFINITIONS } from "@/features/communications/constants";
import type {
  CommunicationTemplateKey,
  CommunicationTemplateRecord,
  CommunicationTemplateSnapshot,
} from "@/types/communication-templates";

/**
 * Renders a communication template by replacing placeholders with values.
 *
 * All placeholders use kebab-case: {company-name}, {first-name}, {invoice-button}
 * Variable keys must match exactly (kebab-case).
 */
export const renderCommunicationTemplate = (
  templateString: string,
  variables: Record<string, string | null>
): string => {
  let result = templateString;

  Object.entries(variables).forEach(([key, value]) => {
    result = result.replace(new RegExp(`\\{${key}\\}`, "g"), value ?? "");
  });

  return result;
};

export const toCommunicationTemplateSnapshot = (
  key: CommunicationTemplateKey,
  record: CommunicationTemplateRecord | null
): CommunicationTemplateSnapshot => {
  const definition = COMMUNICATION_TEMPLATE_DEFINITIONS[key];

  if (!record) {
    return {
      key,
      name: definition.label,
      description: definition.helpText,
      emailSubject: definition.defaultEmailSubject,
      emailBody: definition.defaultEmailBody,
      smsBody: definition.defaultSmsBody,
      updatedAt: null,
    };
  }

  return {
    key: record.template_key,
    name: record.name,
    description: record.description,
    emailSubject: record.email_subject ?? definition.defaultEmailSubject,
    emailBody: record.email_body ?? definition.defaultEmailBody,
    smsBody: record.sms_body ?? definition.defaultSmsBody,
    updatedAt: record.updated_at,
  };
};
