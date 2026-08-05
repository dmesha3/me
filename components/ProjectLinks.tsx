"use client";

import { useCallback, useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { Project } from "@/data/profile";

type ProjectLinksProps = {
  project: Project;
  className?: string;
};

function isExternalLink(href: string) {
  return /^https?:\/\//.test(href);
}

export function ProjectLinks({ project, className }: ProjectLinksProps) {
  const projectUrl = project.projectUrl?.trim();
  const githubUrl = project.githubUrl?.trim();
  const screenshots = project.screenshots ?? [];
  const hasProjectUrl = Boolean(projectUrl);
  const hasGithubUrl = Boolean(githubUrl);
  const isClosedSource = project.openSource === false;
  const shouldRender =
    hasProjectUrl || hasGithubUrl || isClosedSource || screenshots.length > 0;

  const [isOpen, setIsOpen] = useState(false);
  const [index, setIndex] = useState(0);

  const openGallery = useCallback(() => {
    if (screenshots.length === 0) return;
    setIndex(0);
    setIsOpen(true);
  }, [screenshots.length]);

  const closeGallery = useCallback(() => setIsOpen(false), []);

  const prevImage = useCallback(
    () => setIndex((i) => (i - 1 + screenshots.length) % screenshots.length),
    [screenshots.length]
  );

  const nextImage = useCallback(
    () => setIndex((i) => (i + 1) % screenshots.length),
    [screenshots.length]
  );

  useEffect(() => {
    if (!isOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") closeGallery();
      if (e.key === "ArrowLeft") prevImage();
      if (e.key === "ArrowRight") nextImage();
    }

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, closeGallery, prevImage, nextImage]);

  if (!shouldRender) {
    return null;
  }

  return (
    <>
      <div
        className={
          className ??
          "mt-5 flex flex-wrap items-center gap-4 text-xs uppercase tracking-[0.2em]"
        }
      >
        {hasProjectUrl && projectUrl ? (
          <Link
            href={projectUrl}
            target={isExternalLink(projectUrl) ? "_blank" : undefined}
            rel={isExternalLink(projectUrl) ? "noreferrer" : undefined}
            className="text-muted underline underline-offset-4 hover:text-fg"
          >
            Live project
          </Link>
        ) : screenshots.length > 0 ? (
          <button
            type="button"
            onClick={openGallery}
            className="cursor-pointer text-muted underline underline-offset-4 hover:text-fg"
          >
            Live project
          </button>
        ) : null}
        {hasGithubUrl && githubUrl ? (
          <Link
            href={githubUrl}
            target={isExternalLink(githubUrl) ? "_blank" : undefined}
            rel={isExternalLink(githubUrl) ? "noreferrer" : undefined}
            className="text-muted underline underline-offset-4 hover:text-fg"
          >
            GitHub
          </Link>
        ) : null}
        {isClosedSource ? (
          <span className="text-muted">Closed source</span>
        ) : null}
      </div>

      {isOpen ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={closeGallery}
        >
          <div
            className="relative w-full max-w-3xl"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={closeGallery}
              aria-label="Close"
              className="absolute -top-10 right-0 cursor-pointer text-xs uppercase tracking-[0.2em] text-white hover:text-gray-300"
            >
              Close
            </button>
            <div className="relative h-[70vh] w-full">
              <Image
                src={screenshots[index]}
                alt={`${project.name} screenshot ${index + 1}`}
                fill
                className="rounded-lg object-contain"
              />
            </div>
            <div className="mt-4 flex items-center justify-between text-xs uppercase tracking-[0.2em] text-white">
              {screenshots.length > 1 ? (
                <button
                  type="button"
                  onClick={prevImage}
                  className="cursor-pointer hover:text-gray-300"
                >
                  Previous
                </button>
              ) : (
                <span />
              )}
              <span>
                {index + 1} / {screenshots.length}
              </span>
              {screenshots.length > 1 ? (
                <button
                  type="button"
                  onClick={nextImage}
                  className="cursor-pointer hover:text-gray-300"
                >
                  Next
                </button>
              ) : (
                <span />
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
