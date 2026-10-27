"use client";

import Image from "next/image";
import { useState } from "react";
import { fallbackImageFor, type WorkProject } from "@/lib/work";

interface WorkProjectImageProps {
  project: WorkProject;
  index: number;
  sizes: string;
  className?: string;
  priority?: boolean;
  /**
   * Overrides the project's own alt text. Pass an empty string when the
   * image sits inside a link that is already named by the text beside it.
   */
  alt?: string;
}

/**
 * The project image, with a fallback to the bundled artwork.
 *
 * The CMS points each project at a Vercel Blob object, and those objects can
 * go missing while the media record survives — which leaves a broken image.
 * The bundled assets under /public/services are the same artwork, so fall
 * back to those. `||` rather than `??` throughout: a CMS project with no
 * media resolves to an empty string, which is falsy.
 *
 * This is the only part of the project page that needs to run in the browser,
 * which keeps the rest of the page server-rendered.
 */
export function WorkProjectImage({
  project,
  index,
  className,
  sizes,
  priority = false,
  alt,
}: WorkProjectImageProps) {
  const [fallback, setFallback] = useState<string | undefined>(undefined);
  const staticImage = fallbackImageFor(project, index);
  const src = fallback || project.image || staticImage || "";

  if (!src) return null;

  return (
    <Image
      src={src}
      alt={alt ?? project.alt}
      fill
      priority={priority}
      sizes={sizes}
      className={className}
      onError={() => {
        if (!staticImage || staticImage === src) return;
        setFallback(staticImage);
      }}
    />
  );
}
