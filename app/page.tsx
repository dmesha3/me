import Image from "next/image";
import Link from "next/link";
import { AnimatedReveal } from "@/components/AnimatedReveal";
import { Badge } from "@/components/Badge";
import { ButtonLink } from "@/components/Button";
import { Card } from "@/components/Card";
import { Container } from "@/components/Container";
import { ProjectLinks } from "@/components/ProjectLinks";
import { Section } from "@/components/Section";
import { CurrentlyBuilding } from "@/components/CurrentlyBuilding";
import {
  currentFocus,
  howIBuildSystems,
  experiences,
  profile,
  projects,
  techStack
} from "@/data/profile";

export const metadata = {
  title: `${profile.name} | Developer Portfolio`,
  description: profile.headline
};

export default function HomePage() {
  return (
    <>
      <section className="border-b border-border py-16">
        <Container>
          <div className="grid gap-10 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <AnimatedReveal>
              <div>
                <p className="text-xs uppercase tracking-[0.3em] text-muted">
                  {profile.role}
                </p>
                <h1 className="mt-4 font-display text-4xl tracking-tightest text-fg md:text-5xl">
                  {profile.name}
                </h1>
                <p className="mt-6 max-w-2xl text-base text-muted md:text-lg">
                  {profile.headline}
                </p>
                <div className="mt-8 flex flex-wrap items-center gap-4">
                  <ButtonLink href="/projects" variant="primary">
                    View Projects
                  </ButtonLink>
                  <ButtonLink href="/contact" variant="outline">
                    Contact
                  </ButtonLink>
                </div>
                <div className="mt-10 flex flex-wrap gap-3">
                  {techStack.map((tech) => (
                    <Badge key={tech}>{tech}</Badge>
                  ))}
                </div>
              </div>
            </AnimatedReveal>
            <AnimatedReveal delay={0.1}>
              <div className="border border-border bg-surface p-6">
                <div className="relative aspect-[4/5] w-full overflow-hidden border border-border">
                  <Image
                    src="/profile.png"
                    alt={`${profile.name} profile photo`}
                    fill
                    className="object-cover"
                    priority
                  />
                </div>
                <div className="mt-6 space-y-2 text-xs uppercase tracking-[0.2em] text-muted">
                  <p>{profile.location}</p>
                  <p>Available for development work</p>
                </div>
              </div>
            </AnimatedReveal>
          </div>
        </Container>
      </section>

      <Section eyebrow="Background" title="Work experience">
        <div className="grid gap-6 md:grid-cols-3">
          {experiences.map((experience, index) => (
            <AnimatedReveal key={experience.company} delay={index * 0.05}>
              <Card className="h-full">
                <p className="text-xs uppercase tracking-[0.2em] text-muted">
                  {experience.period}
                </p>
                <h3 className="mt-4 font-display text-xl">{experience.company}</h3>
                <p className="mt-3 text-sm text-muted">{experience.title}</p>
              </Card>
            </AnimatedReveal>
          ))}
        </div>
        <div className="mt-10">
          <ButtonLink href="/experience" variant="outline">
            View experience
          </ButtonLink>
        </div>
      </Section>

      <Section eyebrow="Projects" title="Featured projects">
        <div className="grid gap-6 lg:grid-cols-3">
          {projects.slice(0, 3).map((project, index) => (
            <AnimatedReveal key={project.name} delay={index * 0.08}>
              <Card className="flex h-full flex-col">
                <div className="flex-1">
                  <p className="text-xs uppercase tracking-[0.2em] text-muted">
                    {project.role}
                  </p>
                  <h3 className="mt-4 font-display text-2xl text-fg">
                    {project.name}
                  </h3>
                  <p className="mt-3 text-sm text-muted">
                    {project.description}
                  </p>
                  <ProjectLinks project={project} />
                  <div className="mt-4 space-y-3 text-sm">
                    <p>
                      <span className="text-xs uppercase tracking-[0.2em] text-muted">
                        Problem
                      </span>
                      <span className="mt-2 block text-muted">
                        {project.problem}
                      </span>
                    </p>
                    <p>
                      <span className="text-xs uppercase tracking-[0.2em] text-muted">
                        Solution
                      </span>
                      <span className="mt-2 block text-muted">
                        {project.solution}
                      </span>
                    </p>
                  </div>
                </div>
                <div className="mt-6 flex flex-wrap gap-2">
                  {project.tech.map((tech) => (
                    <Badge key={`${project.name}-${tech}`}>{tech}</Badge>
                  ))}
                </div>
              </Card>
            </AnimatedReveal>
          ))}
        </div>
        <div className="mt-10">
          <ButtonLink href="/projects" variant="outline">
            View all projects
          </ButtonLink>
        </div>
      </Section>

      <Section eyebrow="Process" title="How I work">
        <div className="grid gap-6 lg:grid-cols-3">
          {howIBuildSystems.map((item, index) => (
            <AnimatedReveal key={item.title} delay={index * 0.08}>
              <Card>
                <h3 className="font-display text-xl text-fg">{item.title}</h3>
                <p className="mt-4 text-sm text-muted">{item.description}</p>
              </Card>
            </AnimatedReveal>
          ))}
        </div>
      </Section>

      <Section eyebrow="Now" title="Current focus">
        <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <AnimatedReveal>
            <div className="border border-border bg-surface p-6">
              <ul className="space-y-4 text-sm text-muted">
                {currentFocus.map((item) => (
                  <li key={item} className="border-b border-border pb-4 last:border-b-0">
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </AnimatedReveal>
          <AnimatedReveal delay={0.1}>
            <CurrentlyBuilding />
          </AnimatedReveal>
        </div>
        <div className="mt-10 flex flex-wrap items-center gap-4">
          <Link
            href="/contact"
            className="text-xs uppercase tracking-[0.2em] text-muted underline underline-offset-4"
          >
            Let's build together
          </Link>
        </div>
      </Section>
    </>
  );
}
