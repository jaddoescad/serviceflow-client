import { COMMUNICATION_TEMPLATE_DEFINITIONS } from "./constants";
import type {
  CommunicationTemplateKey,
  CommunicationTemplateRecord,
  CommunicationTemplateSnapshot,
} from "./types";

const toAliasKeys = (key: string): string[] => {
  const dashed = key
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/[_\s]+/g, "-")
    .toLowerCase();
  const snake = dashed.replace(/-/g, "_");

  const aliases = new Set([key, dashed, snake]);

  // Allow both *_url and *_button style placeholders to resolve from the same value
  Array.from(aliases).forEach((alias) => {
    if (/-?url$/.test(alias)) {
      const base = alias.replace(/[-_]?url$/, "");
      aliases.add(`${base}-button`);
      aliases.add(`${base}_button`);
    }
  });

  return Array.from(aliases);
};

export const renderCommunicationTemplate = (
  templateString: string,
  variables: Record<string, string | null>
): string => {
  let result = templateString;

  const expanded = new Map<string, string | null>();
  Object.entries(variables).forEach(([key, value]) => {
    toAliasKeys(key).forEach((alias) => {
      if (!expanded.has(alias)) {
        expanded.set(alias, value ?? "");
      }
    });
  });

  // Common synonyms
  if (expanded.has("clientName") && !expanded.has("customer-name")) {
    const value = expanded.get("clientName") ?? "";
    ["customer-name", "customer_name", "customerName"].forEach((alias) =>
      expanded.set(alias, value)
    );
  }

  expanded.forEach((value, key) => {
    const regex = new RegExp(`{{?${key}}}?`, "g");
    result = result.replace(regex, value ?? "");
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
