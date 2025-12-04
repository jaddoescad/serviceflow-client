import { type ReactNode, useState, useRef, useEffect } from "react";
import type { DealDetailSnapshot } from "@/types/deal-details";
import { DealStageSelector } from "./deal-stage-selector";
import { DEAL_STAGE_PIPELINE_MAP } from "../constants";
import { formatFullName } from "@/lib/name";
import { ConfirmDialog } from "@/components/ui/library";

import type { DealStageId } from "../types";
import type { DripSequenceRecord } from "@/features/drips";

type DealSummaryCardProps = {
  snapshot: DealDetailSnapshot;
  className?: string;
  onEdit?: () => void;
  onArchive?: () => void;
  onUnarchive?: () => void;
  onDelete?: () => void;
  isArchiving?: boolean;
  isUnarchiving?: boolean;
  isDeleting?: boolean;
  onToggleDrips?: (enable: boolean) => void;
  isTogglingDrips?: boolean;
  dripStatusMessage?: string | null;
  dripSequencesByStage?: Record<DealStageId, DripSequenceRecord>;
  onStageChange?: (stage: DealStageId, enableDrips: boolean) => void;
  isUpdatingStage?: boolean;
  stageChangeError?: string | null;
};

const tagLabelClass = "text-[13px] sm:text-[11px] font-semibold uppercase tracking-wide text-slate-500";
const infoLabelClass = "text-[13px] sm:text-[11px] font-semibold uppercase tracking-wide text-slate-500";
const infoValueClass = "text-[15px] sm:text-[13px] font-medium text-slate-900";
const infoValueMutedClass = "text-[15px] sm:text-[13px] font-medium text-slate-400";
const sectionHeadingClass = "text-[13px] sm:text-[11px] font-semibold uppercase tracking-wide text-slate-500";

export function DealSummaryCard({
  snapshot,
  className,
  onEdit,
  onArchive,
  onUnarchive,
  onDelete,
  isArchiving = false,
  isUnarchiving = false,
  isDeleting = false,
  onToggleDrips,
  isTogglingDrips = false,
  dripStatusMessage,
  dripSequencesByStage,
  onStageChange,
  isUpdatingStage = false,
  stageChangeError = null,
}: DealSummaryCardProps) {
  const contact = snapshot.deal.contact;
  const serviceAddress = snapshot.deal.service_address;
  const primaryEmail = contact?.email ?? snapshot.deal.email;
  const primaryPhone = snapshot.deal.phone ?? contact?.phone ?? null;
  const leadSource = snapshot.deal.lead_source?.trim() || null;
  const dripsActive = !snapshot.deal.disable_drips;
  const isArchived = Boolean(snapshot.deal.archived_at);

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<"archive" | "unarchive" | "delete" | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isDropdownOpen]);

  const handleArchiveClick = () => {
    setIsDropdownOpen(false);
    setConfirmAction("archive");
  };

  const handleUnarchiveClick = () => {
    setIsDropdownOpen(false);
    setConfirmAction("unarchive");
  };

  const handleDeleteClick = () => {
    setIsDropdownOpen(false);
    setConfirmAction("delete");
  };

  const handleConfirm = () => {
    if (confirmAction === "archive") {
      onArchive?.();
    } else if (confirmAction === "unarchive") {
      onUnarchive?.();
    } else if (confirmAction === "delete") {
      onDelete?.();
    }
  };

  const handleCloseConfirm = () => {
    setConfirmAction(null);
  };

  const renderAssignment = (label: string, name: string | null) => {
    const display = name?.trim() || null;
    const initials = display
      ? display
          .split(/\s+/)
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase() ?? "")
          .join("")
      : "NA";

    const fallback = label === "Project Manager" ? "No Project Manager" : "Unassigned";

    return (
      <DetailRow
        key={label}
        label={label}
        value={
          <div className="flex items-center gap-3 sm:gap-2.5">
            <span className="flex h-8 w-8 sm:h-6 sm:w-6 items-center justify-center rounded-full bg-slate-200 text-[12px] sm:text-[10px] font-semibold text-slate-600">
              {initials}
            </span>
            <span className={display ? infoValueClass : infoValueMutedClass}>{display ?? fallback}</span>
          </div>
        }
      />
    );
  };

  return (
    <section className={`flex h-full flex-col gap-4 sm:gap-6 ${className ?? ""}`}>
      {isArchived && (
        <div className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2">
          <div className="flex items-center gap-2">
            <span className="text-amber-600"><IconArchive /></span>
            <span className="text-[13px] font-semibold text-amber-800">This deal is archived</span>
          </div>
          <p className="mt-1 text-[11px] text-amber-700">
            Archived deals cannot be modified. Use the menu to delete or restore this deal.
          </p>
        </div>
      )}
      <header className="space-y-4">
        <div className="flex flex-col gap-2">
          <div className="space-y-1">
            <div className="flex items-center justify-between w-full">
              <h2 className="text-[20px] sm:text-[22px] font-semibold leading-6 text-slate-900">
                {formatFullName({ first_name: snapshot.deal.first_name, last_name: snapshot.deal.last_name })}
              </h2>
              <div className="flex items-center gap-2">
                {!isArchived && (
                  <button
                    type="button"
                    onClick={onEdit}
                    className="inline-flex h-10 w-10 sm:h-7 sm:w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-700 disabled:opacity-60"
                    aria-label="Edit deal information"
                    disabled={!onEdit}
                  >
                    <IconEdit />
                  </button>
                )}
                <div className="relative" ref={dropdownRef}>
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="inline-flex h-10 w-10 sm:h-7 sm:w-7 items-center justify-center rounded-md border border-slate-200 text-slate-500 transition hover:border-slate-300 hover:text-slate-700"
                    aria-label="More actions"
                    aria-expanded={isDropdownOpen}
                    aria-haspopup="true"
                  >
                    <IconMoreVertical />
                  </button>
                {isDropdownOpen && (
                  <div className="absolute right-0 top-full z-10 mt-1 w-40 sm:w-36 rounded-lg border border-slate-200 bg-white py-1 shadow-lg">
                    {isArchived ? (
                      <button
                        type="button"
                        onClick={handleUnarchiveClick}
                        className="flex w-full items-center gap-2 px-3 py-3 sm:py-2 text-left text-[15px] sm:text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <IconUnarchive />
                        Unarchive
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={handleArchiveClick}
                        className="flex w-full items-center gap-2 px-3 py-3 sm:py-2 text-left text-[15px] sm:text-sm text-slate-700 hover:bg-slate-50"
                      >
                        <IconArchive />
                        Archive
                      </button>
                    )}
                    <button
                      type="button"
                      onClick={handleDeleteClick}
                      className="flex w-full items-center gap-2 px-3 py-3 sm:py-2 text-left text-[15px] sm:text-sm text-rose-600 hover:bg-rose-50"
                    >
                      <IconTrash />
                      Delete
                    </button>
                  </div>
                )}
                </div>
              </div>
            </div>
            <ConfirmDialog
              open={confirmAction === "archive"}
              onClose={handleCloseConfirm}
              onConfirm={handleConfirm}
              title="Archive Deal"
              description="Are you sure you want to archive this deal? It will be removed from the pipeline but can be restored later."
              confirmLabel="Archive"
              cancelLabel="Cancel"
              variant="warning"
              loading={isArchiving}
            />
            <ConfirmDialog
              open={confirmAction === "unarchive"}
              onClose={handleCloseConfirm}
              onConfirm={handleConfirm}
              title="Unarchive Deal"
              description="Are you sure you want to restore this deal? It will be added back to the pipeline."
              confirmLabel="Unarchive"
              cancelLabel="Cancel"
              variant="info"
              loading={isUnarchiving}
            />
            <ConfirmDialog
              open={confirmAction === "delete"}
              onClose={handleCloseConfirm}
              onConfirm={handleConfirm}
              title="Delete Deal"
              description="Are you sure you want to permanently delete this deal? This action cannot be undone."
              confirmLabel="Delete"
              cancelLabel="Cancel"
              variant="danger"
              loading={isDeleting}
            />
            <p className="text-[13px] sm:text-[11px] font-medium uppercase tracking-wide text-slate-400">ID {snapshot.deal.id.slice(0, 8)}</p>
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] sm:text-[10px] font-semibold uppercase tracking-wide text-slate-500">Drip</span>
          <div className="flex items-center gap-3 sm:gap-2">
            <DealStageSelector
              value={snapshot.deal.stage}
              pipelineId={DEAL_STAGE_PIPELINE_MAP[snapshot.deal.stage]}
              selectClassName="w-auto"
              disabled={isArchived}
              appointmentCount={snapshot.appointments?.length ?? 0}
              proposalCount={snapshot.proposals?.length ?? 0}
              dealLabel={formatFullName({ first_name: snapshot.deal.first_name, last_name: snapshot.deal.last_name })}
              defaultDripsEnabled={!snapshot.deal.disable_drips}
              dripSequencesByStage={dripSequencesByStage}
              onStageChange={onStageChange}
              isUpdating={isUpdatingStage}
              stageChangeError={stageChangeError}
            />
            {!isArchived && (
              <button
                type="button"
                onClick={() => onToggleDrips?.(!dripsActive)}
                disabled={!onToggleDrips || isTogglingDrips}
                className="inline-flex items-center disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span
                  className={`relative inline-flex h-6 w-11 sm:h-5 sm:w-9 items-center rounded-full transition-colors ${dripsActive ? "bg-emerald-500" : "bg-slate-300"}`}
                >
                  <span
                    className={`inline-block h-5 w-5 sm:h-4 sm:w-4 transform rounded-full bg-white shadow transition-transform ${dripsActive ? "translate-x-5 sm:translate-x-4" : "translate-x-0.5"}`}
                  />
                </span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Contact Card - iOS style */}
      <section className="rounded-xl sm:rounded-lg bg-white sm:bg-transparent border border-slate-200 sm:border-0 overflow-hidden">
        {/* Contact rows */}
        <div className="divide-y divide-slate-100 sm:divide-y-0 sm:space-y-2">
          {primaryPhone && (
            <a
              href={`tel:${primaryPhone}`}
              className="flex items-center gap-4 px-4 py-3.5 sm:px-1 sm:py-1.5 hover:bg-slate-50 sm:hover:bg-transparent transition-colors"
            >
              <span className="flex h-10 w-10 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-green-500 sm:bg-transparent text-white sm:text-slate-500">
                <IconPhone />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] sm:text-[10px] font-medium text-slate-500">mobile</p>
                <p className="text-[17px] sm:text-[13px] text-sky-600 font-normal truncate">{primaryPhone}</p>
              </div>
            </a>
          )}
          {primaryEmail && (
            <a
              href={`mailto:${primaryEmail}`}
              className="flex items-center gap-4 px-4 py-3.5 sm:px-1 sm:py-1.5 hover:bg-slate-50 sm:hover:bg-transparent transition-colors"
            >
              <span className="flex h-10 w-10 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-sky-500 sm:bg-transparent text-white sm:text-slate-500">
                <IconMail />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] sm:text-[10px] font-medium text-slate-500">email</p>
                <p className="text-[17px] sm:text-[13px] text-sky-600 font-normal truncate">{primaryEmail}</p>
              </div>
            </a>
          )}
          {serviceAddress && (
            <a
              href={`https://maps.google.com/?q=${encodeURIComponent(`${serviceAddress.address_line1}, ${serviceAddress.city}, ${serviceAddress.state} ${serviceAddress.postal_code}`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-4 px-4 py-3.5 sm:px-1 sm:py-1.5 hover:bg-slate-50 sm:hover:bg-transparent transition-colors"
            >
              <span className="flex h-10 w-10 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-red-500 sm:bg-transparent text-white sm:text-slate-500">
                <IconMapPin />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] sm:text-[10px] font-medium text-slate-500">address</p>
                <p className="text-[17px] sm:text-[13px] text-slate-900 font-normal">{serviceAddress.address_line1}</p>
                <p className="text-[15px] sm:text-[12px] text-slate-500">{serviceAddress.city}, {serviceAddress.state} {serviceAddress.postal_code}</p>
              </div>
            </a>
          )}
          {leadSource && (
            <div className="flex items-center gap-4 px-4 py-3.5 sm:px-1 sm:py-1.5">
              <span className="flex h-10 w-10 sm:h-5 sm:w-5 items-center justify-center rounded-full bg-purple-500 sm:bg-transparent text-white sm:text-slate-500">
                <IconGlobe />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-[12px] sm:text-[10px] font-medium text-slate-500">source</p>
                <p className="text-[17px] sm:text-[13px] text-slate-900 font-normal">{leadSource}</p>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Team Card - iOS style */}
      <section className="rounded-xl sm:rounded-lg bg-white sm:bg-transparent border border-slate-200 sm:border-0 overflow-hidden">
        <div className="divide-y divide-slate-100 sm:divide-y-0 sm:space-y-2">
          <TeamMemberRow label="Salesperson" name={snapshot.deal.salesperson} />
          <TeamMemberRow label="Project Manager" name={snapshot.deal.project_manager} />
          <TeamMemberRow label="Crew" name={snapshot.deal.crew?.name ?? null} />
        </div>
      </section>
    </section>
  );
}

function TeamMemberRow({ label, name }: { label: string; name: string | null }) {
  const display = name?.trim() || null;
  const fallback = label === "Project Manager" ? "No PM" : label === "Crew" ? "No Crew" : "Unassigned";

  return (
    <div className="flex items-center justify-between px-4 py-3.5 sm:px-1 sm:py-1.5">
      <p className="text-[15px] sm:text-[11px] font-medium text-slate-500">{label}</p>
      <p className={`text-[17px] sm:text-[13px] font-normal ${display ? "text-slate-900" : "text-slate-400"}`}>
        {display ?? fallback}
      </p>
    </div>
  );
}

function SidebarSection({ children }: { children: ReactNode }) {
  return <section className="space-y-2 sm:space-y-1.5">{children}</section>;
}

function DetailList({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`flex flex-col gap-3 sm:gap-2 ${className}`}>{children}</div>;
}

function DetailRow({
  icon,
  label,
  value,
  hideLabel = false,
}: {
  icon?: ReactNode;
  label: string;
  value: ReactNode;
  hideLabel?: boolean;
}) {
  const containerPadding = hideLabel ? "px-0.5 py-1 sm:py-0.5" : "px-0.5 pt-2 pb-1 sm:pb-0.5";
  const contentGap = hideLabel ? "gap-0" : "gap-2";

  return (
    <div className={`flex items-start gap-3 sm:gap-2 ${containerPadding}`} aria-label={hideLabel ? label : undefined}>
      {icon ? (
        <span className="mt-0.5 flex h-5 w-5 sm:h-4 sm:w-4 items-center justify-center text-slate-500" aria-hidden="true">
          {icon}
        </span>
      ) : null}
      <div className={`flex min-w-0 flex-1 flex-col ${contentGap}`}>
        {hideLabel ? <span className="sr-only">{label}</span> : <p className={infoLabelClass}>{label}</p>}
        <div className="text-[15px] sm:text-[13px] font-medium text-slate-900 leading-5 sm:leading-4 break-words [&>a]:text-sky-600 [&>a]:hover:text-sky-700">
          {value}
        </div>
      </div>
    </div>
  );
}

function IconEdit() {
  return (
    <svg
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M12.5 4.06 15.94 7.5" />
      <path d="M4 12.06 12.06 4l3.88 3.88L7.88 16H4v-3.94Z" />
    </svg>
  );
}

function IconUser() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 sm:h-4 sm:w-4"
    >
      <path d="M16 19c0-2.21-2.686-4-6-4s-6 1.79-6 4" />
      <circle cx="10" cy="7" r="4" />
    </svg>
  );
}

function IconMail() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 sm:h-4 sm:w-4"
    >
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 6-8.97 6.43a2 2 0 0 1-2.3 0L2 6" />
    </svg>
  );
}

function IconPhone() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 sm:h-4 sm:w-4"
    >
      <path d="M22 16.92V21a1 1 0 0 1-1.09 1 19.8 19.8 0 0 1-8.63-3.06 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 3 4.11 1 1 0 0 1 4 3h4.09A1 1 0 0 1 9 3.72l1.2 2.79a1 1 0 0 1-.27 1.18L8.6 8.4a16 16 0 0 0 6 6l.69-.33a1 1 0 0 1 1.18.27L19.28 16a1 1 0 0 1 .24 1.05Z" />
    </svg>
  );
}

function IconMapPin() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 sm:h-4 sm:w-4"
    >
      <path d="M20 10c0 5.25-8 12-8 12s-8-6.75-8-12a8 8 0 0 1 16 0Z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

function IconGlobe() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-5 w-5 sm:h-4 sm:w-4"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10Z" />
    </svg>
  );
}

function IconMoreVertical() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <circle cx="12" cy="12" r="1" />
      <circle cx="12" cy="5" r="1" />
      <circle cx="12" cy="19" r="1" />
    </svg>
  );
}

function IconArchive() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
    </svg>
  );
}

function IconUnarchive() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <rect width="20" height="5" x="2" y="3" rx="1" />
      <path d="M4 8v11a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8" />
      <path d="M10 12h4" />
      <path d="M12 9v6" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="h-4 w-4"
    >
      <path d="M3 6h18" />
      <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
      <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
      <line x1="10" x2="10" y1="11" y2="17" />
      <line x1="14" x2="14" y1="11" y2="17" />
    </svg>
  );
}
