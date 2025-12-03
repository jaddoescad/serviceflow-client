import {
  useEffect,
  useMemo,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import type { DealRecord, ScheduleDealInput } from "@/features/deals";
import { DEAL_STAGE_OPTIONS, scheduleDeal, updateDealAppointment, useDealInvalidation } from "@/features/deals";
import { syncAppointmentToGoogle } from "@/lib/google-calendar-sync";
import { useCrews } from "@/hooks";
import { useCompanyMembers } from "@/features/companies";
import type { CommunicationTemplateSnapshot } from "@/types/communication-templates";
import { renderCommunicationTemplate, toCommunicationTemplateSnapshot } from "@/lib/communication-templates";
import { getCommunicationTemplateByKey } from "@/features/communications";

import type { JobScheduleModalProps, FormState } from "./types";
import {
  JOB_DEFAULT_EMAIL_SUBJECT,
  JOB_DEFAULT_EMAIL_BODY,
  JOB_DEFAULT_SMS_BODY,
} from "./types";
import {
  TIME_OPTIONS,
  resolveMemberUserId,
  toDateInput,
  toTimeInput,
  parseDateTime,
  formatDateParts,
  buildJobTemplateVars,
  getDealDisplayName,
  buildMemberOptions,
  includeCurrentOption,
} from "./utils";

export function useJobScheduleForm({
  open,
  mode,
  companyId,
  companyName,
  deal,
  appointment,
  onClose,
  onScheduled,
  companyMembers: externalCompanyMembers,
}: JobScheduleModalProps) {
  const { invalidateDashboard, invalidateCompanyDeals, invalidateDeal } = useDealInvalidation();
  const [form, setForm] = useState<FormState | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [jobTemplate, setJobTemplate] = useState<CommunicationTemplateSnapshot>(() =>
    toCommunicationTemplateSnapshot("job_schedule", null)
  );

  // Fetch crews only when modal is open
  const { data: crews = [], isLoading: isLoadingCrews } = useCrews(open ? companyId : undefined);

  // Fetch company members only when modal is open (if not provided externally)
  const { data: fetchedCompanyMembers = [] } = useCompanyMembers(
    open && !externalCompanyMembers ? companyId : undefined
  );
  const companyMembers = externalCompanyMembers ?? fetchedCompanyMembers;

  const projectManagerOptions = useMemo(
    () =>
      buildMemberOptions(
        companyMembers.filter((member) => member.role === "project_manager" || member.role === "admin")
      ),
    [companyMembers]
  );

  const crewOptions = useMemo(() => {
    return crews
      .map((crew) => ({ value: crew.id, label: crew.name }))
      .sort((a, b) => a.label.localeCompare(b.label));
  }, [crews]);

  // Load job template
  useEffect(() => {
    let cancelled = false;
    if (!open || !companyId) return;
    (async () => {
      try {
        const template = await getCommunicationTemplateByKey(companyId, "job_schedule");
        if (!cancelled && template) {
          setJobTemplate(template);
        }
      } catch {
        if (!cancelled) {
          setJobTemplate(toCommunicationTemplateSnapshot("job_schedule", null));
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, companyId]);

  const stageLabel = useMemo(() => {
    const option = DEAL_STAGE_OPTIONS.find((item) => item.id === "project_scheduled");
    return option?.label ?? "Project Scheduled";
  }, []);

  // Initialize form when modal opens
  useEffect(() => {
    if (!open) {
      setForm(null);
      setError(null);
      setIsSubmitting(false);
      return;
    }

    if (!deal) {
      return;
    }

    const sourceAppointment = appointment ?? deal.latest_appointment ?? null;
    const defaultEmailRecipient =
      deal.email?.trim() || deal.contact?.email?.trim() || "";
    const defaultSmsRecipient = deal.phone?.trim() || deal.contact?.phone?.trim() || "";

    const startParts = formatDateParts(sourceAppointment?.scheduled_start ?? null);
    const endParts = formatDateParts(sourceAppointment?.scheduled_end ?? null);

    const defaultStart = (() => {
      const base = new Date();
      base.setDate(base.getDate() + 1);
      base.setHours(8, 0, 0, 0);
      return base;
    })();

    const defaultEnd = (() => {
      const base = new Date(defaultStart.getTime());
      base.setHours(base.getHours() + 9);
      return base;
    })();

    const startDate = startParts.date || toDateInput(defaultStart);
    const endDate = endParts.date || startDate;

    setForm({
      projectManager: deal.project_manager ?? "",
      crewId: deal.crew_id ?? "",
      startDate,
      endDate,
      startTime: startParts.time || toTimeInput(defaultStart),
      endTime: endParts.time || toTimeInput(defaultEnd),
      sendEmail: sourceAppointment?.send_email ?? deal.send_email ?? false,
      sendSms: sourceAppointment?.send_sms ?? deal.send_sms ?? false,
      emailSubject: jobTemplate.emailSubject || JOB_DEFAULT_EMAIL_SUBJECT,
      emailMessage: jobTemplate.emailBody || JOB_DEFAULT_EMAIL_BODY,
      smsMessage: jobTemplate.smsBody || JOB_DEFAULT_SMS_BODY,
      emailRecipients: defaultEmailRecipient,
      smsRecipients: defaultSmsRecipient,
    });
    setError(null);
    setIsSubmitting(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, deal?.id, appointment?.id]);

  // Update template fields when template loads (only if user hasn't edited them)
  const templateSubject = jobTemplate.emailSubject;
  const templateBody = jobTemplate.emailBody;
  const templateSms = jobTemplate.smsBody;

  useEffect(() => {
    if (!open) return;

    setForm((prev) => {
      if (!prev) return prev;
      // Only update if user hasn't manually edited
      const newSubject = prev.emailSubject === JOB_DEFAULT_EMAIL_SUBJECT || prev.emailSubject === ""
        ? (templateSubject || JOB_DEFAULT_EMAIL_SUBJECT)
        : prev.emailSubject;
      const newBody = prev.emailMessage === JOB_DEFAULT_EMAIL_BODY || prev.emailMessage === ""
        ? (templateBody || JOB_DEFAULT_EMAIL_BODY)
        : prev.emailMessage;
      const newSms = prev.smsMessage === JOB_DEFAULT_SMS_BODY || prev.smsMessage === ""
        ? (templateSms || JOB_DEFAULT_SMS_BODY)
        : prev.smsMessage;

      // Only return new object if something changed
      if (newSubject === prev.emailSubject && newBody === prev.emailMessage && newSms === prev.smsMessage) {
        return prev;
      }

      return {
        ...prev,
        emailSubject: newSubject,
        emailMessage: newBody,
        smsMessage: newSms,
      };
    });
  }, [open, templateSubject, templateBody, templateSms]);

  const handleChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const target = event.target;
    const { name, value, type } = target;
    const isCheckbox = type === "checkbox" && target instanceof HTMLInputElement;

    setForm((previous) => {
      if (!previous) return previous;

      const nextValue = isCheckbox ? target.checked : value;
      const nextForm = { ...previous, [name]: nextValue } as FormState;

      // Pre-fill email fields when enabling email
      if (name === "sendEmail" && nextValue === true) {
        if (!previous.emailSubject) {
          nextForm.emailSubject = jobTemplate.emailSubject || JOB_DEFAULT_EMAIL_SUBJECT;
        }
        if (!previous.emailMessage) {
          nextForm.emailMessage = jobTemplate.emailBody || JOB_DEFAULT_EMAIL_BODY;
        }
        if (!previous.emailRecipients) {
          nextForm.emailRecipients = deal?.email?.trim() || deal?.contact?.email?.trim() || "";
        }
      }

      // Pre-fill SMS fields when enabling SMS
      if (name === "sendSms" && nextValue === true) {
        if (!previous.smsMessage) {
          nextForm.smsMessage = jobTemplate.smsBody || JOB_DEFAULT_SMS_BODY;
        }
        if (!previous.smsRecipients) {
          nextForm.smsRecipients = deal?.phone?.trim() || deal?.contact?.phone?.trim() || "";
        }
      }

      return nextForm;
    });
  };

  const handleTextareaChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setForm((previous) => {
      if (!previous) return previous;
      return { ...previous, [name]: value } as FormState;
    });
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!deal || !form) {
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const startDate = parseDateTime(form.startDate, form.startTime);
      const endDate = parseDateTime(form.endDate, form.endTime);

      if (!startDate || !endDate) {
        throw new Error("Provide valid dates and times.");
      }

      if (endDate.getTime() < startDate.getTime()) {
        throw new Error("End must be after the start time.");
      }

      const baseAssignedTo = (appointment?.assigned_to ?? deal.assigned_to ?? "").trim();
      const selectedCrew = crews.find((crew) => crew.id === form.crewId) ?? null;
      const normalizedAssignee = resolveMemberUserId(baseAssignedTo, companyMembers);
      const shouldClearAssignment = (form.sendEmail || form.sendSms) && !selectedCrew;
      const appointmentAssignedTo = shouldClearAssignment ? null : normalizedAssignee;
      const emailRecipients = form.emailRecipients.trim();
      const smsRecipients = form.smsRecipients.trim();
      const firstEmailRecipient = emailRecipients
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)[0];
      const firstSmsRecipient = smsRecipients
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean)[0];

      const templateVars = buildJobTemplateVars(form, deal, companyName);
      const renderedEmailSubject = renderCommunicationTemplate(
        form.emailSubject.trim() || jobTemplate.emailSubject || JOB_DEFAULT_EMAIL_SUBJECT,
        templateVars
      );
      const renderedEmailBody = renderCommunicationTemplate(
        form.emailMessage.trim() || jobTemplate.emailBody || JOB_DEFAULT_EMAIL_BODY,
        templateVars
      );
      const renderedSmsBody = renderCommunicationTemplate(
        form.smsMessage.trim() || jobTemplate.smsBody || JOB_DEFAULT_SMS_BODY,
        templateVars
      );

      if (form.sendEmail && !firstEmailRecipient) {
        throw new Error("Provide at least one email recipient.");
      }

      if (form.sendSms && !firstSmsRecipient) {
        throw new Error("Provide at least one SMS recipient.");
      }

      if (form.sendEmail && (!renderedEmailSubject.trim() || !renderedEmailBody.trim())) {
        throw new Error("Email subject and body are required.");
      }

      if (form.sendSms && !renderedSmsBody.trim()) {
        throw new Error("SMS message is required.");
      }

      const appointmentPayload = {
        company_id: deal.company_id ?? companyId,
        assigned_to: appointmentAssignedTo,
        crew_id: selectedCrew ? selectedCrew.id : null,
        event_color: appointment?.event_color ?? deal.event_color ?? "purple",
        scheduled_start: startDate.toISOString(),
        scheduled_end: endDate.toISOString(),
        appointment_notes: appointment?.appointment_notes ?? null,
        send_email: form.sendEmail,
        send_sms: form.sendSms,
      } satisfies ScheduleDealInput["appointment"];

      const dealPayload = {
        first_name: deal.first_name,
        last_name: deal.last_name,
        email: firstEmailRecipient || deal.email,
        phone: firstSmsRecipient || deal.phone,
        lead_source: deal.lead_source,
        contact_address_id: deal.contact_address_id,
        salesperson: deal.salesperson,
        project_manager: form.projectManager.trim() || null,
        assigned_to: appointmentAssignedTo,
        crew_id: form.crewId ? form.crewId : null,
        event_color: appointment?.event_color ?? deal.event_color ?? "purple",
        send_email: form.sendEmail,
        send_sms: form.sendSms,
        disable_drips: deal.disable_drips,
      } satisfies ScheduleDealInput["deal"];

      const payload: ScheduleDealInput = {
        stage: "project_scheduled",
        appointment: appointmentPayload,
        deal: dealPayload,
      };

      const communications: ScheduleDealInput["communications"] = {};
      if (appointmentPayload.send_email && firstEmailRecipient) {
        communications.email = {
          to: firstEmailRecipient,
          subject: renderedEmailSubject,
          body: renderedEmailBody,
        };
      }
      if (appointmentPayload.send_sms && firstSmsRecipient) {
        communications.sms = {
          to: firstSmsRecipient,
          body: renderedSmsBody,
        };
      }

      if (Object.keys(communications).length > 0) {
        payload.communications = communications;
      }

      let updatedDeal: DealRecord;

      if (mode === "edit" && appointment) {
        updatedDeal = await updateDealAppointment(deal.id, {
          appointmentId: appointment.id,
          appointment: appointmentPayload,
          deal: dealPayload,
          communications: Object.keys(communications).length > 0 ? communications : undefined,
        });
      } else {
        updatedDeal = await scheduleDeal(deal.id, payload);
      }

      // Invalidate React Query cache
      invalidateDashboard(companyId, "sales");
      invalidateDashboard(companyId, "jobs");
      invalidateCompanyDeals(companyId);
      invalidateDeal(deal.id);

      // Enrich the returned deal with the crew object since the API only returns crew_id
      const enrichedDeal = {
        ...updatedDeal,
        crew: selectedCrew ? { id: selectedCrew.id, name: selectedCrew.name } : null,
      };

      void syncAppointmentToGoogle(enrichedDeal, enrichedDeal.latest_appointment, companyName);
      onScheduled(enrichedDeal);
      onClose();
    } catch (submitError) {
      console.error("Failed to schedule job", submitError);
      setError(submitError instanceof Error ? submitError.message : "Could not schedule job.");
      setIsSubmitting(false);
    }
  };

  const dealTitle = getDealDisplayName(deal) || "Untitled Job";
  const projectManagerSelectOptions = form ? includeCurrentOption(projectManagerOptions, form.projectManager) : [];
  const crewSelectOptions = form ? includeCurrentOption(crewOptions, form.crewId) : [];
  const primaryButtonLabel = isSubmitting ? "Saving…" : mode === "edit" ? "Reschedule Job" : "Schedule Job";

  return {
    form,
    error,
    isSubmitting,
    isLoadingCrews,
    stageLabel,
    dealTitle,
    projectManagerSelectOptions,
    crewSelectOptions,
    primaryButtonLabel,
    timeOptions: TIME_OPTIONS,
    handleChange,
    handleTextareaChange,
    handleSubmit,
  };
}
