"use client";

import { Fragment, useEffect, useRef, type CSSProperties } from "react";
import Image from "next/image";
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { pad2 } from "@/lib/utils";
import { mediaUrl, type HomeSuccessStoriesData } from "@/lib/cms";
import "./SuccessStories.css";

interface Project {
  title: string;
  description: string;
  stat: string;
  statCaption: string;
  image: string;
}

interface SuccessStoriesProps {
  data?: HomeSuccessStoriesData | null;
}

const PARALLAX_SHIFT = 8;
const FALLBACK_VIDEO = "/videos/success-stories-mammoth.webm";
const FALLBACK_LABEL = "Success Stories";
const FALLBACK_PAGER_TAG = "SS";
const DESKTOP_VIDEO_HOVER =
  "(min-width: 901px) and (hover: hover) and (pointer: fine)";

const FALLBACK_PROJECTS: ReadonlyArray<Project> = [
  {
    title: "IQVIA",
    description:
      "IQVIA didn't need another efficiency promise. It needed systems that worked around the business. We built customized CRM and ERP solutions around real workflows — supported by strategic and technology-led frameworks designed to reduce friction across teams.",
    stat: "—",
    statCaption: "Making complex workflow better.",
    image: "/services/growth-strategy.png",
  },
  {
    title: "Manipal Hospitals",
    description:
      "Healthcare is full of information. But people don't remember information — they remember how a brand made them feel. We shaped storytelling, branding campaigns and strategic communication around a clearer idea of trust — making the brand more human, recognizable and relevant to the people it serves.",
    stat: "—",
    statCaption: "Making trust easier to feel.",
    image: "/services/content-creation.png",
  },
  {
    title: "Redmonk Wellness",
    description:
      "Wellness brands don't need more content. They need content that feels worth stopping for. We built a sharper content approach around short, crisp and raw communication — designed for the way people actually consume information today.",
    stat: "—",
    statCaption: "Turning attention into action.",
    image: "/services/social-media.png",
  },
  {
    title: "Team Taurus",
    description:
      "Real estate is often reduced to location, price and square feet. People don't buy spaces like spreadsheets. They imagine what it will feel like to live there. We helped sharpen the brand narrative around the experience behind the spaces — making the communication more distinctive, considered and relevant to the people it was built for.",
    stat: "—",
    statCaption: "Spaces that feel lived in.",
    image: "/services/brand-identity.png",
  },
];

export function SuccessStories({ data }: SuccessStoriesProps) {
  const label = data?.label ?? FALLBACK_LABEL;
  const pagerTag = data?.pagerTag ?? FALLBACK_PAGER_TAG;
  const videoSrc = mediaUrl(data?.video) ?? FALLBACK_VIDEO;

  const projects: Project[] =
    data?.projects && data.projects.length > 0
      ? data.projects.map((p, i) => {
          const fallback = FALLBACK_PROJECTS[i % FALLBACK_PROJECTS.length];
          return {
            title: p.title ?? fallback.title,
            description: p.description ?? fallback.description,
            stat: p.stat ?? fallback.stat,
            statCaption: p.statCaption ?? fallback.statCaption,
            image: mediaUrl(p.image) ?? fallback.image,
          };
        })
      : [...FALLBACK_PROJECTS];

  const total = projects.length;
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const videos = Array.from(
      section.querySelectorAll<HTMLVideoElement>("[data-ss-video]"),
    );
    const visibility = new Map(videos.map((video) => [video, 0]));
    const desktopQuery = window.matchMedia(DESKTOP_VIDEO_HOVER);
    let pointerX = -1;
    let pointerCanPlay = false;

    const setVideoVisible = (video: HTMLVideoElement, visible: boolean) => {
      video.classList.toggle("success-stories__video--playing", visible);
      video
        .closest(".success-stories__image-figure")
        ?.classList.toggle(
          "success-stories__image-figure--video-playing",
          visible,
        );
    };

    const pauseVideo = (video: HTMLVideoElement, reset = false) => {
      video.pause();
      setVideoVisible(video, false);
      if (reset) video.currentTime = 0;
    };

    const playVideo = (video: HTMLVideoElement) => {
      if (!video.paused) return;
      void video.play().catch(() => undefined);
    };

    const updatePlayback = () => {
      if (!desktopQuery.matches) {
        videos.forEach((video) => {
          if ((visibility.get(video) ?? 0) >= 0.45) playVideo(video);
          else pauseVideo(video);
        });
        return;
      }

      let focusedVideo: HTMLVideoElement | null = null;
      let focusedRatio = 0;
      visibility.forEach((ratio, video) => {
        if (ratio > focusedRatio) {
          focusedRatio = ratio;
          focusedVideo = video;
        }
      });

      const target = pointerCanPlay && focusedRatio >= 0.15 ? focusedVideo : null;
      videos.forEach((video) => {
        if (video === target) playVideo(video);
        else pauseVideo(video);
      });
    };

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const video = entry.target as HTMLVideoElement;
          visibility.set(video, entry.intersectionRatio);
          if (!entry.isIntersecting) pauseVideo(video, true);
        });
        updatePlayback();
      },
      { threshold: [0.1, 0.5, 0.9] },
    );

    const showVideo = (event: Event) => {
      const video = event.currentTarget as HTMLVideoElement;
      setVideoVisible(video, true);
    };

    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      const nextCanPlay = pointerX > window.innerWidth * 0.2;
      if (nextCanPlay === pointerCanPlay) return;
      pointerCanPlay = nextCanPlay;
      updatePlayback();
    };

    const onWindowBlur = () => {
      pointerCanPlay = false;
      updatePlayback();
    };

    const onModeChange = () => {
      pointerCanPlay =
        desktopQuery.matches && pointerX > window.innerWidth * 0.2;
      updatePlayback();
    };

    videos.forEach((video) => {
      video.addEventListener("playing", showVideo);
      observer.observe(video);
    });
    window.addEventListener("pointermove", onPointerMove, { passive: true });
    window.addEventListener("blur", onWindowBlur);
    desktopQuery.addEventListener("change", onModeChange);

    return () => {
      observer.disconnect();
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("blur", onWindowBlur);
      desktopQuery.removeEventListener("change", onModeChange);
      videos.forEach((video) => {
        video.pause();
        video
          .closest(".success-stories__image-figure")
          ?.classList.remove("success-stories__image-figure--video-playing");
        video.removeEventListener("playing", showVideo);
      });
    };
  }, []);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      const frames = Array.from(
        section.querySelectorAll<HTMLElement>("[data-ss-parallax]"),
      );
      if (frames.length === 0) return;

      let tl: gsap.core.Timeline | null = null;

      const buildTimeline = () => {
        const sectionH = section.offsetHeight || 1;
        tl = gsap.timeline({
          defaults: { ease: "none", force3D: true },
          scrollTrigger: {
            trigger: section,
            start: "top bottom",
            end: "bottom top",
            scrub: true,
          },
        });
        frames.forEach((imageEl) => {
          const a = imageEl.offsetTop;
          const h = imageEl.offsetHeight;
          tl!.fromTo(
            imageEl,
            { yPercent: -PARALLAX_SHIFT },
            {
              yPercent: PARALLAX_SHIFT,
              duration: h / sectionH,
              ease: "none",
              force3D: true,
            },
            a / sectionH,
          );
        });
      };

      buildTimeline();

      const onRefresh = () => {
        tl?.kill();
        tl = null;
        buildTimeline();
      };
      ScrollTrigger.addEventListener("refresh", onRefresh);

      return () => {
        ScrollTrigger.removeEventListener("refresh", onRefresh);
        tl?.kill();
      };
    }, section);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} className="success-stories" id="success-stories">
      <div className="success-stories__inner">
        <div className="success-stories__label-col">
          <span className="success-stories__dot" aria-hidden="true" />
          <span className="success-stories__label">{label}</span>
        </div>

        {projects.map((project, i) => (
          <Fragment key={project.title}>
            {i > 0 && (
              <div
                className="success-stories__divider"
                aria-hidden="true"
                style={{ "--ss-row": i * 2 } as CSSProperties}
              />
            )}
            <figure
              className="success-stories__image-figure"
              style={{ "--ss-row": i * 2 + 1 } as CSSProperties}
            >
              <div className="success-stories__image-frame" data-ss-parallax="">
                <Image
                  src={project.image}
                  alt={`${project.title} project imagery`}
                  fill
                  sizes="(max-width: 960px) 100vw, 50vw"
                  className="success-stories__image"
                  priority={i === 0}
                />
              </div>
              <video
                className="success-stories__video"
                data-ss-video=""
                muted
                loop
                playsInline
                preload="metadata"
                poster={project.image}
              >
                <source src={videoSrc} type="video/webm" />
              </video>
            </figure>

            <article
              className="success-stories__text-block"
              style={{ "--ss-row": i * 2 + 1 } as CSSProperties}
            >
              <div
                className="success-stories__pager"
                aria-label={`Case ${i + 1} of ${total}`}
              >
                <span className="success-stories__pager-tag">{pagerTag}</span>
                <span className="success-stories__pager-arrow" aria-hidden="true">
                  →
                </span>
                <span className="success-stories__pager-count">
                  <span className="success-stories__pager-current">
                    {pad2(i + 1)}
                  </span>
                  <span className="success-stories__pager-sep">/</span>
                  <span className="success-stories__pager-total">
                    {pad2(total)}
                  </span>
                </span>
              </div>

              <h2 className="success-stories__title">{project.title}</h2>
              <p className="success-stories__description">
                {project.description}
              </p>

              <div className="success-stories__stat-block">
                <div className="success-stories__stat">{project.stat}</div>
                <p className="success-stories__stat-caption">
                  {project.statCaption}
                </p>
              </div>
            </article>
          </Fragment>
        ))}
      </div>
    </section>
  );
}

export default SuccessStories;
