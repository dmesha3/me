import Link from "next/link";
import { AnimatedReveal } from "@/components/AnimatedReveal";
import { Card } from "@/components/Card";
import { ContactForm } from "@/components/ContactForm";
import { CopyButton } from "@/components/CopyButton";
import { Section } from "@/components/Section";
import { profile } from "@/data/profile";

export const metadata = {
  title: `Contact | ${profile.name}`,
  description: "Start a conversation about building resilient systems."
};

export default function ContactPage() {
  return (
    <Section eyebrow="Contact" title="Let's build something resilient">
      <div className="grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
        <AnimatedReveal>
          <Card>
            <ContactForm />
          </Card>
        </AnimatedReveal>
        <AnimatedReveal delay={0.1}>
          <div className="space-y-6">
            <Card>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Direct</p>
              <p className="mt-3 text-sm text-fg">{profile.email}</p>
              <div className="mt-4 flex flex-wrap gap-3">
                <CopyButton value={profile.email} label="Copy Email" />
                <Link
                  href={`mailto:${profile.email}`}
                  className="border border-border px-3 py-2 text-xs uppercase tracking-[0.2em] text-fg transition-colors hover:border-fg"
                >
                  Email Me
                </Link>
              </div>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Social</p>
              <div className="mt-4 flex flex-col gap-3">
                <Link
                  href={profile.socials.github}
                  className="text-sm uppercase tracking-[0.2em] text-fg underline underline-offset-4"
                  target="_blank"
                  rel="noreferrer"
                >
                  GitHub
                </Link>
                <CopyButton value={profile.socials.github} label="Copy GitHub" />
                <Link
                  href={profile.socials.x}
                  className="text-sm uppercase tracking-[0.2em] text-fg underline underline-offset-4"
                  target="_blank"
                  rel="noreferrer"
                >
                  X
                </Link>
                <CopyButton value={profile.socials.x} label="Copy X" />
              </div>
            </Card>
            <Card>
              <p className="text-xs uppercase tracking-[0.2em] text-muted">Availability</p>
              <p className="mt-3 text-sm text-muted">
                I take on a small number of advisory roles and founder-led builds
                each quarter. Share your goals and timeline, and I will respond
                with fit and next steps.
              </p>
            </Card>
          </div>
        </AnimatedReveal>
      </div>
    </Section>
  );
}
