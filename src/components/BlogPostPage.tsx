import Link from "next/link";
import Image from "next/image";
import { RichText } from "@payloadcms/richtext-lexical/react";
import type { PostData } from "@/lib/cms";
import { asMediaObject, mediaAlt, mediaUrl } from "@/lib/cms";
import { formatPostDate, readingTimeOf } from "@/lib/blog";
import "./BlogPostPage.css";

/**
 * Hallmark · /blog/[slug] — a single journal article.
 *
 * Minimal editorial article: back link, meta row, one oversized
 * wordmark-style title, lede, cover image, then a centred 68ch
 * measure of rich text. Same paper/ink language as the rest of the site.
 */

type RichTextData = Parameters<typeof RichText>[0]["data"];

/** The Lexical field holds a root node with at least one child block. */
function hasContent(content: unknown): content is RichTextData {
  if (!content || typeof content !== "object") return false;
  const root = (content as { root?: unknown }).root;
  if (!root || typeof root !== "object") return false;
  const children = (root as { children?: unknown }).children;
  return Array.isArray(children) && children.length > 0;
}

function BackLink({ className }: { className: string }) {
  return (
    <Link className={className} href="/blog">
      <span aria-hidden="true">←</span> All posts
    </Link>
  );
}

export function BlogPostPage({ post }: { post: PostData }) {
  const coverSrc = mediaUrl(post.coverImage);
  const coverObj = asMediaObject(post.coverImage);
  const coverWidth = coverObj?.width ?? 1600;
  const coverHeight = coverObj?.height ?? 1000;

  return (
    <main className="bpost">
      {/* Label strip — back link clears the fixed header */}
      <div className="bpost__strip">
        <BackLink className="bpost__back" />
      </div>

      <header className="bpost__hero">
        <p className="bpost__meta">
          <time dateTime={post.publishedAt ?? undefined}>
            {formatPostDate(post.publishedAt)}
          </time>
          <span aria-hidden="true">·</span>
          <span>{readingTimeOf(post.content)}</span>
          {post.author ? (
            <>
              <span aria-hidden="true">·</span>
              <span>{post.author}</span>
            </>
          ) : null}
        </p>
        <h1 className="bpost__title">{post.title}</h1>
        {post.excerpt ? (
          <p className="bpost__lede">{post.excerpt}</p>
        ) : null}
      </header>

      {coverSrc ? (
        <figure className="bpost__cover">
          <Image
            src={coverSrc}
            alt={mediaAlt(post.coverImage, post.title ?? "Journal post")}
            width={coverWidth}
            height={coverHeight}
            sizes="100vw"
            priority
          />
        </figure>
      ) : null}

      {hasContent(post.content) ? (
        <div className="bpost__body">
          <RichText data={post.content} />
        </div>
      ) : null}

      <nav className="bpost__footer-nav" aria-label="Journal">
        <BackLink className="bpost__back" />
      </nav>
    </main>
  );
}
