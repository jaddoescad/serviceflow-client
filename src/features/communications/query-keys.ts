import type { CommunicationTemplateKey } from "./types";

export const communicationKeys = {
  all: ["communications"] as const,
  templates: () => [...communicationKeys.all, "templates"] as const,
  templateList: (companyId: string) =>
    [...communicationKeys.templates(), "list", companyId] as const,
  templateByKey: (companyId: string, key: CommunicationTemplateKey) =>
    [...communicationKeys.templates(), companyId, key] as const,
};
