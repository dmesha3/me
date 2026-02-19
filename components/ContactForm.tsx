"use client";

import { useMutation } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Button } from "@/components/Button";
import { contactFormSchema, type ContactFormInput } from "@/lib/validation/contact";

type FormState = {
  kind: "success" | "error";
  message: string;
};

type ContactApiResponse = {
  success?: boolean;
  message?: string;
  error?: string;
};

async function submitContactForm(payload: ContactFormInput) {
  const response = await fetch("/api/contact", {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(payload)
  });

  const result = (await response.json()) as ContactApiResponse;

  if (!response.ok) {
    throw new Error(result.error || "Unable to send message. Please try again.");
  }

  return result;
}

export function ContactForm() {
  const [status, setStatus] = useState<FormState | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<ContactFormInput>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      name: "",
      email: "",
      message: "",
      company: ""
    }
  });

  const mutation = useMutation({
    mutationFn: submitContactForm,
    onSuccess: (result) => {
      reset();
      setStatus({
        kind: "success",
        message: result.message || "Message sent successfully."
      });
    },
    onError: (error) => {
      setStatus({
        kind: "error",
        message:
          error instanceof Error
            ? error.message
            : "Network error. Please try again."
      });
    }
  });

  return (
    <form
      className="space-y-5"
      onSubmit={handleSubmit((values) => {
        setStatus(null);
        mutation.mutate(values);
      })}
      noValidate
    >
      <div className="grid gap-4">
        <label className="text-xs uppercase tracking-[0.2em] text-muted">
          Name
          <input
            type="text"
            autoComplete="name"
            {...register("name")}
            className="mt-2 w-full border border-border bg-bg px-4 py-3 text-sm text-fg focus:border-fg focus:outline-none"
          />
          {errors.name ? (
            <span className="mt-2 block text-[11px] normal-case tracking-normal text-accent">
              {errors.name.message}
            </span>
          ) : null}
        </label>
        <label className="text-xs uppercase tracking-[0.2em] text-muted">
          Email
          <input
            type="email"
            autoComplete="email"
            {...register("email")}
            className="mt-2 w-full border border-border bg-bg px-4 py-3 text-sm text-fg focus:border-fg focus:outline-none"
          />
          {errors.email ? (
            <span className="mt-2 block text-[11px] normal-case tracking-normal text-accent">
              {errors.email.message}
            </span>
          ) : null}
        </label>
        <label className="text-xs uppercase tracking-[0.2em] text-muted">
          Message
          <textarea
            rows={5}
            {...register("message")}
            className="mt-2 w-full border border-border bg-bg px-4 py-3 text-sm text-fg focus:border-fg focus:outline-none"
          />
          {errors.message ? (
            <span className="mt-2 block text-[11px] normal-case tracking-normal text-accent">
              {errors.message.message}
            </span>
          ) : null}
        </label>
        <input
          type="text"
          tabIndex={-1}
          autoComplete="off"
          className="hidden"
          aria-hidden="true"
          {...register("company")}
        />
      </div>
      <Button type="submit" variant="primary" disabled={mutation.isPending}>
        {mutation.isPending ? "Sending..." : "Send Message"}
      </Button>
      {status ? (
        <p
          className={`text-sm ${status.kind === "error" ? "text-accent" : "text-muted"}`}
          role="status"
          aria-live="polite"
        >
          {status.message}
        </p>
      ) : null}
    </form>
  );
}
