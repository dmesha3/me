import Link from "next/link";
import { profile } from "@/data/profile";
import { Container } from "@/components/Container";
import { CopyButton } from "@/components/CopyButton";

export function Footer() {
  return (
    <footer className="border-t border-border py-12">
      <Container>
        <div className="flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-muted">{profile.location}</p>
            <p className="mt-3 font-display text-2xl">Have a project in mind?</p>
          </div>
          <div className="flex flex-wrap items-center gap-4">
            <Link
              href={profile.socials.github}
              className="border border-border px-3 py-2 text-xs uppercase tracking-[0.2em] text-fg transition-colors hover:border-fg"
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </Link>
            <Link
              href={profile.socials.x}
              className="border border-border px-3 py-2 text-xs uppercase tracking-[0.2em] text-fg transition-colors hover:border-fg"
              target="_blank"
              rel="noreferrer"
            >
              X
            </Link>
            <CopyButton value={profile.email} label="Copy Email" />
          </div>
        </div>
        <div className="mt-10 flex flex-col gap-2 text-xs uppercase tracking-[0.2em] text-muted">
          <span>© {new Date().getFullYear()} {profile.name}</span>
          <span>Built by Meshack Kazimoto</span>
        </div>
      </Container>
    </footer>
  );
}
