import Link from "next/link";
import type { PostData } from "@/lib/cms";
import { mediaAlt, mediaUrl } from "@/lib/cms";
import { formatPostDate, readingTimeOf } from "@/lib/blog";
import "./JournalGrid.css";

/**
 * Hallmark · journal card grid.
 *
 * Sharp-cornered square cards, 3 across on desktop and 2 on small
 * screens: the top 60% is a flush-bleed cover image (no padding, no
 * bezels — the img fills its box edge to edge), the bottom 40%
 * carries the date, reading time and title.
 */
export function JournalGrid({ posts }: { posts: PostData[] }) {
  return (
    <div className="jg">
      {posts.map((post) => {
        const src = mediaUrl(post.coverImage);
        return (
          <Link
            key={post.id}
            href={`/blog/${post.slug}`}
            className="jg__card"
          >
            <span className="jg__media">
              {src ? (
                <img
                  src={src}
                  alt={mediaAlt(post.coverImage, post.title)}
                  loading="lazy"
                  decoding="async"
                />
              ) : null}
            </span>
            <span className="jg__body">
              <span className="jg__meta">
                {formatPostDate(post.publishedAt)}
                <span aria-hidden="true"> · </span>
                {readingTimeOf(post.content)}
              </span>
              <span className="jg__card-title">{post.title}</span>
            </span>
          </Link>
        );
      })}
    </div>
  );
}
