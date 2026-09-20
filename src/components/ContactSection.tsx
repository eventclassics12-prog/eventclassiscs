"use client";

import { useState, type FormEvent } from "react";
import { ContactCard } from "@/components/ui/contact-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { MailIcon, PhoneIcon, MapPinIcon, CheckIcon } from "lucide-react";
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
 * Form behaviour: posts to `/api/zoho/leads`, which forwards the
 * submission to Zoho CRM as a Lead. If the server route returns 503
 * (env vars missing — typical in local dev before Zoho creds are wired)
 * we fall back to the original `mailto:` handoff so the form keeps
 * working. The UI state machine is unchanged: idle → submitting →
 * success / error.
 */
export function ContactSection() {
  const [status, setStatus] = useState<
    "idle" | "submitting" | "success" | "error"
  >("idle");

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
        // the form keeps working during local development.
        const subject = encodeURIComponent(`Website enquiry — ${name}`);
        const body = encodeURIComponent(
          `Name: ${name}\nEmail: ${email}\nPhone: ${phone}\n\n${message}`,
        );
        window.location.href = `mailto:info@eventclassics.in?subject=${subject}&body=${body}`;
        setStatus("success");
        event.currentTarget.reset();
        return;
      }

      if (!res.ok) {
        setStatus("error");
        return;
      }

      setStatus("success");
      event.currentTarget.reset();
    } catch {
      setStatus("error");
    }
  };

  return (
    <section className="contact-section" id="contact-form">
      <div className="contact-section__inner">
        <ContactCard
          title="Get in touch"
          description="Have a brief, an idea, or a question about how we work? Fill out the form and we'll get back within one business day. For active briefs, write to us directly."
          contactInfo={[
            {
              icon: MailIcon,
              label: "Email",
              value: "info@eventclassics.in",
            },
            {
              icon: PhoneIcon,
              label: "Studio",
              value: "983-1234-059",
            },
            {
              icon: MapPinIcon,
              label: "Address",
              value: "Kolkata, India · Working worldwide",
              className: "col-span-2",
            },
          ]}
        >
          <form className="contact-form w-full space-y-4" onSubmit={handleSubmit} noValidate>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact-name">Name</Label>
              <Input
                id="contact-name"
                name="name"
                type="text"
                autoComplete="name"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact-email">Email</Label>
              <Input
                id="contact-email"
                name="email"
                type="email"
                autoComplete="email"
                required
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact-phone">Phone</Label>
              <Input
                id="contact-phone"
                name="phone"
                type="tel"
                autoComplete="tel"
              />
            </div>
            <div className="flex flex-col gap-2">
              <Label htmlFor="contact-message">Message</Label>
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
              {status === "submitting" ? "Sending…" : "Send message"}
            </Button>
            {status === "success" && (
              <p
                className="contact-form__feedback contact-form__feedback--success"
                role="status"
              >
                <CheckIcon aria-hidden="true" className="h-4 w-4" />
                Your mail client should be open. We'll reply within a
                business day.
              </p>
            )}
            {status === "error" && (
              <p
                className="contact-form__feedback contact-form__feedback--error"
                role="alert"
              >
                Please fill in your name, email and message.
              </p>
            )}
          </form>
        </ContactCard>
      </div>
    </section>
  );
}

export default ContactSection;
