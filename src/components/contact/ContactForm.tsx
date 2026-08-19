"use client";

import { useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { CheckIcon } from "@/components/ui/Icons";
import { siteConfig, whatsappLink } from "@/lib/site";
import { cn } from "@/lib/utils";
import { useCatalogue } from "@/store/catalogue";

interface Fields {
  name: string;
  phone: string;
  email: string;
  interest: string;
  message: string;
}

type Errors = Partial<Record<keyof Fields, string>>;

const EMPTY: Fields = { name: "", phone: "", email: "", interest: "", message: "" };

function validate(values: Fields): Errors {
  const errors: Errors = {};
  if (values.name.trim().length < 2) errors.name = "Please enter your name.";
  if (!/^[+\d][\d\s-]{7,15}$/.test(values.phone.trim())) {
    errors.phone = "Enter a valid phone number.";
  }
  if (values.email.trim() && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(values.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (values.message.trim().length < 10) {
    errors.message = "Tell us a little more (at least 10 characters).";
  }
  return errors;
}

/**
 * Frontend-only enquiry form. There is no backend yet, so on submit we validate,
 * show a success state, and hand the message off to WhatsApp — which is how the
 * business already takes enquiries. Swapping in a real endpoint later means
 * replacing the body of `onSubmit` only.
 */
export function ContactForm() {
  const { categories } = useCatalogue();
  const [values, setValues] = useState<Fields>(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [status, setStatus] = useState<"idle" | "sending" | "sent">("idle");

  const set = (key: keyof Fields) => (value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
    if (errors[key]) setErrors((prev) => ({ ...prev, [key]: undefined }));
  };

  const onSubmit = async (event: FormEvent) => {
    event.preventDefault();
    const found = validate(values);
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setStatus("sending");
    // Simulated latency — replace with a POST to the enquiries endpoint later.
    await new Promise((resolve) => window.setTimeout(resolve, 700));

    window.open(
      whatsappLink(
        `New enquiry from ${values.name}\nPhone: ${values.phone}${
          values.email ? `\nEmail: ${values.email}` : ""
        }${values.interest ? `\nInterested in: ${values.interest}` : ""}\n\n${values.message}`,
      ),
      "_blank",
      "noopener,noreferrer",
    );

    setStatus("sent");
  };

  if (status === "sent") {
    return (
      <div className="flex flex-col items-center justify-center rounded-[var(--radius-card)] border border-emerald-600/20 bg-emerald-50/60 px-6 py-16 text-center">
        <div className="flex size-14 items-center justify-center rounded-2xl bg-emerald-600 text-white">
          <CheckIcon className="size-7" strokeWidth={2.5} />
        </div>
        <h2 className="mt-5 text-xl font-semibold">Thanks, {values.name.split(" ")[0]}!</h2>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-ink-600">
          Your enquiry is on its way. We usually reply within one working day — or call{" "}
          <a
            href={`tel:${siteConfig.contact.phone}`}
            className="font-semibold text-brand-700 underline underline-offset-2"
          >
            {siteConfig.contact.phoneDisplay}
          </a>{" "}
          if it&apos;s urgent.
        </p>
        <Button
          variant="outline"
          className="mt-6"
          onClick={() => {
            setValues(EMPTY);
            setStatus("idle");
          }}
        >
          Send another enquiry
        </Button>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="rounded-[var(--radius-card)] border border-ink-200/70 bg-white p-5 shadow-[var(--shadow-soft)] sm:p-7"
    >
      <h2 className="text-lg font-semibold sm:text-xl">Send us a message</h2>
      <p className="mt-1.5 text-sm text-ink-500">
        Fields marked with <span aria-hidden>*</span> are required.
      </p>

      <div className="mt-6 grid gap-5 sm:grid-cols-2">
        <Field
          id="name"
          label="Your name"
          required
          value={values.name}
          onChange={set("name")}
          error={errors.name}
          autoComplete="name"
          placeholder="Ravi Kumar"
        />
        <Field
          id="phone"
          label="Phone"
          required
          type="tel"
          value={values.phone}
          onChange={set("phone")}
          error={errors.phone}
          autoComplete="tel"
          placeholder="+91 98765 43210"
        />
        <Field
          id="email"
          label="Email"
          type="email"
          value={values.email}
          onChange={set("email")}
          error={errors.email}
          autoComplete="email"
          placeholder="you@example.com"
          className="sm:col-span-2"
        />

        <div className="sm:col-span-2">
          <label htmlFor="interest" className="mb-1.5 block text-sm font-medium text-ink-700">
            What are you interested in?
          </label>
          <select
            id="interest"
            value={values.interest}
            onChange={(event) => set("interest")(event.target.value)}
            className="h-12 w-full rounded-xl border border-ink-200 bg-white px-3.5 text-sm text-ink-800 outline-none transition-all focus:border-brand-600/50 focus:ring-4 focus:ring-brand-600/10"
          >
            <option value="">Select an option</option>
            {categories.map((category) => (
              <option key={category.slug} value={category.name}>
                {category.name}
              </option>
            ))}
            <option value="Drone services">Drone services (spraying / survey)</option>
            <option value="Pilot training">Pilot training</option>
            <option value="Other">Something else</option>
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="message" className="mb-1.5 block text-sm font-medium text-ink-700">
            Message <span className="text-brand-700">*</span>
          </label>
          <textarea
            id="message"
            rows={5}
            value={values.message}
            onChange={(event) => set("message")(event.target.value)}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "message-error" : undefined}
            placeholder="Tell us your airframe, payload and what you need…"
            className={cn(
              "w-full resize-y rounded-xl border bg-white px-3.5 py-3 text-sm text-ink-800 outline-none transition-all placeholder:text-ink-400",
              errors.message
                ? "border-brand-600 ring-4 ring-brand-600/10"
                : "border-ink-200 focus:border-brand-600/50 focus:ring-4 focus:ring-brand-600/10",
            )}
          />
          {errors.message ? (
            <p id="message-error" role="alert" className="mt-1.5 text-xs font-medium text-brand-700">
              {errors.message}
            </p>
          ) : null}
        </div>
      </div>

      <Button type="submit" size="lg" className="mt-6" disabled={status === "sending"}>
        {status === "sending" ? (
          <>
            <span
              className="size-4 animate-spin rounded-full border-2 border-white/40 border-t-white"
              aria-hidden
            />
            Sending…
          </>
        ) : (
          "Send enquiry"
        )}
      </Button>

      <p className="mt-3 text-xs text-ink-400">
        Submitting opens WhatsApp with your message pre-filled so we can reply straight away.
      </p>
    </form>
  );
}

function Field({
  id,
  label,
  value,
  onChange,
  error,
  required,
  type = "text",
  placeholder,
  autoComplete,
  className,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  error?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  autoComplete?: string;
  className?: string;
}) {
  return (
    <div className={className}>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-ink-700">
        {label} {required ? <span className="text-brand-700">*</span> : null}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        required={required}
        placeholder={placeholder}
        autoComplete={autoComplete}
        onChange={(event) => onChange(event.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className={cn(
          "h-12 w-full rounded-xl border bg-white px-3.5 text-sm text-ink-800 outline-none transition-all placeholder:text-ink-400",
          error
            ? "border-brand-600 ring-4 ring-brand-600/10"
            : "border-ink-200 focus:border-brand-600/50 focus:ring-4 focus:ring-brand-600/10",
        )}
      />
      {error ? (
        <p id={`${id}-error`} role="alert" className="mt-1.5 text-xs font-medium text-brand-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
