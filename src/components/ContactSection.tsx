"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ContactCard } from "@/components/ui/contact-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MailIcon, PhoneIcon, MapPinIcon } from "lucide-react";
import type { PageContactData } from "@/lib/cms";
import "./ContactSection.css";

/**
 * Contact section — the form primitive mounted on the dedicated
 * `/contact-form` route.
 *
 * Single source of truth for the brand contact surface: it re-uses the
 * editorial email/location/socials surfaced in the footer, so the two
 * regions stay in sync. Every "Book a call" / "View Contact" CTA on
 * the site navigates here.
 *
 * Displayed text/labels are driven by the `page-contact` Payload
 * global (prop `data`), each with a fallback to the original copy.
 *
 * Form behaviour: posts to `/api/zoho/leads`, which forwards the
 * submission to Zoho CRM as a Lead. If the server route returns 503
 * (env vars missing — typical in local dev before Zoho creds are wired)
 * we fall back to the original `mailto:` handoff so the form keeps
 * working. Both paths land on `/thank-you`, which the user sees as
 * the confirmation surface. The inline state machine stays narrow
 * (idle → submitting → error) since the success case now lives on a
 * dedicated route and isn't rendered in place.
 */
export function ContactSection({ data }: { data?: PageContactData | null }) {
  const router = useRouter();
  const [status, setStatus] = useState<"idle" | "submitting" | "error">(
    "idle",
  );

  const cardTitle = data?.cardTitle ?? "Get in touch";
  const cardDescription =
    data?.cardDescription ??
    "Have a brief, an idea, or a question about how we work? Fill out the form and we'll get back within one business day. For active briefs, write to us directly.";
  const emailValue = data?.email ?? "info@eventclassics.in";
  const phoneValue = data?.phone ?? "983-1234-059";
  const addressValue = data?.address ?? "Kolkata, India · Working worldwide";
  const labelName = data?.labelName ?? "Name";
  const labelEmail = data?.labelEmail ?? "Email";
  const labelPhone = data?.labelPhone ?? "Phone";
  const labelMessage = data?.labelMessage ?? "Message";
  const submitLabel = data?.submitLabel ?? "Send message";
  const submittingLabel = data?.submittingLabel ?? "Sending…";
  const errorMessage =
    data?.errorMessage ?? "Please fill in your name, email and message.";

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "").trim();
    const email = String(formData.get("email") ?? "").trim();
    const phone = String(formData.get("phone") ?? "").trim();
    const message = String(formData.get("message") ?? "").trim();

    if (!name || !email || !message) {
      setStatus("error");
      return;
    }

    setStatus("submitting");
    try {
      const res = await fetch("/api/zoho/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, phone, message }),
      });

      if (res.status === 503) {
        // Server has no Zoho creds — open the user's mail client so
        // the form keeps working during local development, then route
        // to the confirmation page. `replace` (not push) drops the
        // reset form from the history stack so Back goes wherever
        // the visitor was before they hit Contact.
        const subject = encodeURIComponent(`Website enquiry — ${name}`);
        const body = encodeURIComponent(
          `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\n${message}`,
        );
        window.location.href = `mailto:info@eventclassics.in?subject=${subject}&body=${body}`;
        router.replace("/thank-you");
        return;
      }

      if (!res.ok) {
        setStatus("error");
        return;
      }

      router.replace("/thank-you");
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="contact-section" id="contact-form">
      <div className="contact-section__inner">
        <ContactCard
          title={cardTitle}
          description={cardDescription}
          contactInfo={[
            {
              icon: MailIcon,
              label: "Email",
              value: emailValue,
            },
            {
              icon: PhoneIcon,
              label: "Studio",
              value: phoneValue,
            },
            {
              icon: MapPinIcon,
              label: "Address",
              value: addressValue,
              className: "col-span-2",
            },
          ]}
        >
          <form className="contact-form w-full space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact-name">{labelName}</Label>
              <Input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact-email">{labelEmail}</Label>
              <Input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact-phone">{labelPhone}</Label>
              <Input
                id="contact-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact-message">{labelMessage}</Label>
              <Textarea
                id="contact-message"
                name="message"
                rows={4}
                required
              />
            </div>
            <Button
              className="contact-form__submit w-full rounded-full"
              type="submit"
              disabled={status === "submitting"}
              style={{
                backgroundColor: "#000000",
                color: "#ffffff",
                mixBlendMode: "normal",
              }}
            >
              {status === "submitting" ? submittingLabel : submitLabel}
            </Button>
            {status === "error" && (
              <p
                className="contact-form__feedback contact-form__feedback--error"
                role="alert"
              >
                {errorMessage}
              </p>
            )}
          </form>
        </ContactCard>
      </div>
    </section>
  );
}

export default ContactSection;
