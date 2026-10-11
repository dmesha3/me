import { NotesApp } from "@/components/NotesApp";
import { Section } from "@/components/Section";
import { profile } from "@/data/profile";

export const metadata = {
  title: `Notes | ${profile.name}`,
  description: "A quick clipboard for capturing notes, ideas, and book takeaways.",
  robots: {
    index: false,
    follow: false
  }
};

export default function NotesPage() {
  return (
    <Section eyebrow="Clipboard" title="Notes">
      <p className="mb-8 max-w-2xl text-sm text-muted">
        Capture ideas, book takeaways, and anything worth remembering. Notes are
        always saved in your browser first, so the page works offline. Unlock
        sync with your passphrase and the same notes follow you to every
        device. You can also export or import them as JSON at any time.
      </p>
      <NotesApp />
    </Section>
  );
}
