import { useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { useSessionContext, useCompanyContext } from "@/contexts/AuthContext";
import { useContact, type ContactAddressRecord } from "@/features/contacts";
import { getLatestDealForContact } from "@/features/deals";
import { CopyButton } from "@/components/shared/copy-button";
import { ContactDetailSkeleton } from "@/components/ui/skeleton";

const formatContactName = (firstName: string | null | undefined, lastName: string | null | undefined) => {
  const name = `${firstName ?? ""} ${lastName ?? ""}`.trim();
  return name || "Unnamed contact";
};

const formatAddressLine = (address: ContactAddressRecord) => {
  const parts = [
    address.address_line1,
    address.address_line2,
    address.city,
    address.state,
    address.postal_code,
  ]
    .map((part) => part?.trim())
    .filter((part) => part);

  return parts.length > 0 ? parts.join(", ") : "Address not provided";
};

export default function ContactDetailsPage() {
  const params = useParams();
  const navigate = useNavigate();
  const { isLoading: authLoading } = useSessionContext();
  const { company } = useCompanyContext();
  const contactId = params.contactId as string;

  const { data: contact, isLoading: contactLoading } = useContact(contactId);

  const { data: latestDeal } = useQuery({
    queryKey: ['contacts', contactId, 'latestDeal'],
    queryFn: () => getLatestDealForContact(company!.id, contactId),
    enabled: !!company && !!contactId,
  });

  const serviceAddress = latestDeal?.service_address ?? null;
  const serviceAddressLabel = serviceAddress
    ? formatAddressLine(serviceAddress)
    : "Address not provided";

  useEffect(() => {
    if (authLoading) return;
    if (!company) {
      navigate("/organizations/select");
    }
  }, [authLoading, company, navigate]);

  useEffect(() => {
    if (!contactLoading && !contact) {
      navigate("/contacts");
    }
  }, [contactLoading, contact, navigate]);

  if (authLoading || contactLoading || !contact) {
    return <ContactDetailSkeleton />;
  }

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-6">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-3">
        <div className="flex flex-col gap-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
            Contact
          </p>
          <h1 className="text-xl font-semibold text-slate-900">
            {formatContactName(contact.first_name, contact.last_name)}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="rounded border border-slate-200 px-3 py-1.5 text-[12px] font-medium text-slate-600 transition hover:bg-slate-100"
          >
            Back to pipeline
          </Link>
          <button
            type="button"
            className="rounded bg-blue-600 px-3 py-1.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-blue-700"
          >
            Edit info
          </button>
        </div>
      </header>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-[12px] font-semibold uppercase tracking-[0.08em] text-slate-500">
          Contact details
        </h2>
        <dl className="mt-3 space-y-3 text-[13px] text-slate-700">
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-slate-500">
              Email
            </dt>
            <dd className="flex items-center gap-2">
              {contact.email ? (
                <a
                  href={`mailto:${contact.email}`}
                  className="text-[12px] font-medium text-blue-600 transition hover:underline"
                >
                  {contact.email}
                </a>
              ) : (
                <span className="text-[12px] text-slate-400">Not provided</span>
              )}
              {contact.email ? <CopyButton value={contact.email} /> : null}
            </dd>
          </div>
          <div className="flex items-center justify-between gap-3 border-b border-slate-100 pb-3">
            <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-slate-500">
              Phone
            </dt>
            <dd className="flex items-center gap-2">
              {contact.phone ? (
                <a
                  href={`tel:${contact.phone}`}
                  className="text-[12px] font-medium text-blue-600 transition hover:underline"
                >
                  {contact.phone}
                </a>
              ) : (
                <span className="text-[12px] text-slate-400">Not provided</span>
              )}
              {contact.phone ? <CopyButton value={contact.phone} /> : null}
            </dd>
          </div>
          <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
            <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-slate-500">
              Service address
            </dt>
            <dd className="text-right text-[12px] text-slate-700">{serviceAddressLabel}</dd>
          </div>
          <div className="flex justify-between gap-3">
            <dt className="text-[11px] font-medium uppercase tracking-[0.06em] text-slate-500">
              Created
            </dt>
            <dd className="text-right text-[12px] text-slate-700">
              {new Date(contact.created_at).toLocaleDateString()}
            </dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
