import type { ChangeEvent } from "react";
import { Input } from "@/components/ui/library";
import type { FormState } from "../types";

type ContactInformationSectionProps = {
  form: FormState;
  onInputChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
};

export function ContactInformationSection({
  form,
  onInputChange,
}: ContactInformationSectionProps) {
  return (
    <section className="space-y-2.5">
      <div className="grid gap-2.5 md:grid-cols-2">
        <Input
          type="text"
          name="firstName"
          label="First name"
          value={form.firstName}
          onChange={onInputChange}
          placeholder="Enter first name"
          required
          size="md"
        />
        <Input
          type="text"
          name="lastName"
          label="Last name"
          value={form.lastName}
          onChange={onInputChange}
          placeholder="Enter last name"
          size="md"
        />
        <Input
          type="email"
          name="email"
          label="Email"
          value={form.email}
          onChange={onInputChange}
          placeholder="Enter email"
          size="md"
        />
        <Input
          type="tel"
          name="phone"
          label="Phone"
          value={form.phone}
          onChange={onInputChange}
          placeholder="Enter phone number"
          size="md"
        />
      </div>
    </section>
  );
}
