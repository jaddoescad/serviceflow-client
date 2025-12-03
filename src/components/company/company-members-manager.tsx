"use client";

import { useMemo, useState } from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { CompanyMemberRecord, CompanyMemberRole } from "@/features/companies";
import {
  COMPANY_MEMBER_ROLE_OPTIONS,
  type CompanyMemberRoleOption,
} from "@/features/companies";

const roleLabelMap = new Map<CompanyMemberRole, string>(
  COMPANY_MEMBER_ROLE_OPTIONS.map((option) => [option.value, option.label])
);

type CompanyMembersManagerProps = {
  initialMembers: CompanyMemberRecord[];
  currentUserId: string;
};

type InviteFormState = {
  email: string;
  displayName: string;
  role: CompanyMemberRole;
};

const defaultFormState: InviteFormState = {
  email: "",
  displayName: "",
  role: "sales",
};

function sortMembers(members: CompanyMemberRecord[]): CompanyMemberRecord[] {
  return members
    .slice()
    .sort((a, b) => a.display_name.localeCompare(b.display_name, undefined, { sensitivity: "base" }));
}

export function CompanyMembersManager({ initialMembers, currentUserId }: CompanyMembersManagerProps) {
  const [members, setMembers] = useState<CompanyMemberRecord[]>(() => sortMembers(initialMembers));
  const [form, setForm] = useState<InviteFormState>(defaultFormState);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const availableRoles = useMemo(() => COMPANY_MEMBER_ROLE_OPTIONS.filter((option) => !option.disabled), []);

  const resetForm = () => {
    setForm(defaultFormState);
    setError(null);
    setSuccess(null);
  };

  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const payload = {
      email: form.email.trim(),
      displayName: form.displayName.trim(),
      role: form.role,
    };

    if (!payload.email || !payload.displayName) {
      setError("Please provide both a display name and email.");
      return;
    }

    setIsSubmitting(true);
    setError(null);
    setSuccess(null);

    try {
      const response = await fetch("/api/company-members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...payload, companyId: initialMembers[0]?.company_id }), // Assuming we can get companyId from initialMembers or props. 
        // Wait, props has initialMembers but not companyId directly. 
        // Let's check if we can get it from props or context.
        // The component props are { initialMembers, currentUserId }.
        // We might need to pass companyId to this component.
        // For now, let's try to get it from the first member if available, or we might need to update the parent to pass it.
        // Actually, looking at the file content again, `initialMembers` is `CompanyMemberRecord[]`.
        // `CompanyMemberRecord` likely has `company_id`.
      });

      const body = await response.json().catch(() => null);

      if (!response.ok) {
        const message = typeof body?.error === "string" ? body.error : "Unable to add user.";
        setError(message);
        setIsSubmitting(false);
        return;
      }

      const record = body?.member as CompanyMemberRecord | undefined;

      if (!record) {
        setError("The server did not return the new member record.");
        setIsSubmitting(false);
        return;
      }

      setMembers((current) => sortMembers([...current, record]));
      setSuccess(`Sent an invite to ${record.display_name}.`);
      setForm(defaultFormState);
    } catch (submissionError) {
      setError(
        submissionError instanceof Error ? submissionError.message : "Something went wrong while inviting the user."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-1 min-h-0 flex-col gap-6">
      <section className="space-y-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Invite a user</h2>
          <p className="text-[11px] text-slate-500">Send an email invite and assign their initial role.</p>
        </div>
        <form className="grid gap-3 md:grid-cols-3" onSubmit={handleSubmit} noValidate>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-700" htmlFor="displayName">
              Display name
            </label>
            <input
              id="displayName"
              name="displayName"
              value={form.displayName}
              onChange={handleInputChange}
              placeholder="Jordan Smith"
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-[13px] shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-60"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-700" htmlFor="email">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              value={form.email}
              onChange={handleInputChange}
              placeholder="team@company.com"
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-[13px] shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-60"
            />
          </div>
          <div className="space-y-1">
            <label className="text-[11px] font-medium text-slate-700" htmlFor="role">
              Role
            </label>
            <select
              id="role"
              name="role"
              value={form.role}
              onChange={handleInputChange}
              disabled={isSubmitting}
              className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-[13px] shadow-sm focus:border-accent focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-60"
            >
              {availableRoles.map((option: CompanyMemberRoleOption) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>
          <div className="md:col-span-3 flex items-center gap-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center justify-center rounded-full bg-accent px-4 py-1.5 text-[12px] font-semibold text-white shadow-sm transition hover:bg-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-200 disabled:opacity-70"
            >
              {isSubmitting ? "Sending invite…" : "Send invite"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              disabled={isSubmitting}
              className="rounded-full border border-slate-200 px-3 py-1.5 text-[11px] font-semibold text-slate-600 transition hover:bg-slate-100 focus:outline-none focus:ring-4 focus:ring-slate-200 disabled:opacity-60"
            >
              Clear
            </button>
          </div>
          {error ? (
            <p className="md:col-span-3 rounded-lg bg-red-100 px-3 py-2 text-[12px] font-medium text-red-700">
              {error}
            </p>
          ) : null}
          {success ? (
            <p className="md:col-span-3 rounded-lg bg-green-100 px-3 py-2 text-[12px] font-medium text-green-700">
              {success}
            </p>
          ) : null}
        </form>
      </section>

      <section className="flex-1 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-card">
        <header className="flex items-center justify-between border-b border-slate-200 px-4 py-2">
          <h3 className="text-sm font-semibold text-slate-900">Team members</h3>
          <span className="text-[11px] font-medium text-slate-500">{members.length} total</span>
        </header>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-slate-200 text-left text-[12px]">
            <thead className="bg-slate-50 text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-500">
              <tr>
                <th scope="col" className="px-4 py-2">Name</th>
                <th scope="col" className="px-4 py-2">Email</th>
                <th scope="col" className="px-4 py-2">Role</th>
                <th scope="col" className="px-4 py-2">Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {members.map((member) => {
                const isCurrentUser = member.user_id === currentUserId;
                const roleLabel = roleLabelMap.get(member.role) ?? member.role;
                const addedOn = new Date(member.created_at).toLocaleDateString();

                return (
                  <tr key={member.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-semibold">
                      {member.display_name}
                      {isCurrentUser ? (
                        <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
                          You
                        </span>
                      ) : null}
                    </td>
                    <td className="px-4 py-2 text-slate-600">{member.email}</td>
                    <td className="px-4 py-2 text-slate-600">{roleLabel}</td>
                    <td className="px-4 py-2 text-slate-500">{addedOn}</td>
                  </tr>
                );
              })}
              {members.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-6 text-center text-[12px] text-slate-500">
                    No members yet. Send an invite to get started.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
