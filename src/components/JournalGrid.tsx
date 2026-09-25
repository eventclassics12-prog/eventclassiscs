import Link from "next/link";
import type { PostData } from "@/lib/cms";
import { mediaAlt, mediaUrl } from "@/lib/cms";
import { formatPostDate, readingTimeOf } from "@/lib/blog";
import "./JournalGrid.css";

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
