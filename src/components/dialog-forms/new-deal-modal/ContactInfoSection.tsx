import type { ChangeEvent } from "react";
import { Input } from "@/components/ui/library";
import type { FormState } from "./types";

type ContactInfoSectionProps = {
  form: FormState;
  onInputChange: (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
};

export function ContactInfoSection({ form, onInputChange }: ContactInfoSectionProps) {
  return (
    <section className="space-y-3">
      <div className="grid gap-2.5 md:grid-cols-2">
        <Input
          type="text"
          name="firstName"
          label="First name"
          placeholder="Enter first name"
          value={form.firstName}
          onChange={onInputChange}
          required
          size="md"
        />
        <Input
          type="text"
          name="lastName"
          label="Last name"
          placeholder="Enter last name"
          value={form.lastName}
          onChange={onInputChange}
          size="md"
        />
        <Input
          type="email"
          name="email"
          label="Email"
          placeholder="customer@example.com"
          value={form.email}
          onChange={onInputChange}
          size="md"
        />
        <Input
          type="tel"
          name="phone"
          label="Phone"
          placeholder="(555) 123-4567"
          value={form.phone}
          onChange={onInputChange}
          size="md"
        />
      </div>
    </section>
  );
}
